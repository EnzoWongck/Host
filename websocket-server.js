const WebSocket = require('ws');
const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 存儲遊戲狀態和連接
const gameRooms = new Map();
const connections = new Map();

// 遊戲狀態結構
class GameRoom {
  constructor(gameId) {
    this.gameId = gameId;
    this.gameState = null;
    this.connections = new Set();
    this.lastUpdate = Date.now();
  }

  addConnection(ws) {
    this.connections.add(ws);
    ws.gameId = this.gameId;
  }

  removeConnection(ws) {
    this.connections.delete(ws);
    if (this.connections.size === 0) {
      gameRooms.delete(this.gameId);
    }
  }

  broadcast(data, excludeWs = null) {
    this.connections.forEach(ws => {
      if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    });
  }
}

// WebSocket 連接處理
wss.on('connection', (ws) => {
  console.log('新的 WebSocket 連接');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleMessage(ws, data);
    } catch (error) {
      console.error('解析消息錯誤:', error);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket 連接關閉');
    if (ws.gameId) {
      const room = gameRooms.get(ws.gameId);
      if (room) {
        room.removeConnection(ws);
      }
    }
    connections.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket 錯誤:', error);
  });
});

// 處理消息
function handleMessage(ws, data) {
  const { type, gameId, payload } = data;

  switch (type) {
    case 'JOIN_GAME':
      joinGame(ws, gameId);
      break;
    case 'UPDATE_GAME_STATE':
      updateGameState(ws, gameId, payload);
      break;
    case 'PLAYER_ACTION':
      handlePlayerAction(ws, gameId, payload);
      break;
    case 'EXPENSE_ACTION':
      handleExpenseAction(ws, gameId, payload);
      break;
    case 'SYNC_REQUEST':
      syncGameState(ws, gameId);
      break;
    default:
      console.log('未知消息類型:', type);
  }
}

// 加入遊戲房間
function joinGame(ws, gameId) {
  let room = gameRooms.get(gameId);
  if (!room) {
    room = new GameRoom(gameId);
    gameRooms.set(gameId, room);
  }
  
  room.addConnection(ws);
  connections.set(ws, gameId);
  
  // 發送當前遊戲狀態
  if (room.gameState) {
    ws.send(JSON.stringify({
      type: 'GAME_STATE_SYNC',
      payload: room.gameState
    }));
  }
  
  console.log(`用戶加入遊戲房間: ${gameId}`);
}

// 更新遊戲狀態
function updateGameState(ws, gameId, gameState) {
  const room = gameRooms.get(gameId);
  if (!room) return;
  
  room.gameState = gameState;
  room.lastUpdate = Date.now();
  
  // 廣播給房間內其他用戶
  room.broadcast({
    type: 'GAME_STATE_UPDATED',
    payload: gameState
  }, ws);
  
  console.log(`遊戲狀態更新: ${gameId}`);
}

// 處理玩家操作
function handlePlayerAction(ws, gameId, action) {
  const room = gameRooms.get(gameId);
  if (!room || !room.gameState) return;
  
  // 更新遊戲狀態
  const { playerId, actionType, data } = action;
  const gameState = room.gameState;
  
  switch (actionType) {
    case 'BUY_IN':
      updatePlayerBuyIn(gameState, playerId, data);
      break;
    case 'CASH_OUT':
      updatePlayerCashOut(gameState, playerId, data);
      break;
    case 'UPDATE_PROFIT':
      updatePlayerProfit(gameState, playerId, data);
      break;
    case 'ADD_INSURANCE':
      addInsurance(gameState, data);
      break;
    case 'ADD_RAKE':
      addRake(gameState, data);
      break;
  }
  
  // 廣播更新
  room.broadcast({
    type: 'PLAYER_ACTION_UPDATED',
    payload: { action, gameState }
  }, ws);
}

// 處理支出操作
function handleExpenseAction(ws, gameId, action) {
  const room = gameRooms.get(gameId);
  if (!room || !room.gameState) return;
  
  const { actionType, data } = action;
  const gameState = room.gameState;
  
  switch (actionType) {
    case 'ADD_EXPENSE':
      addExpense(gameState, data);
      break;
    case 'UPDATE_EXPENSE':
      updateExpense(gameState, data);
      break;
    case 'DELETE_EXPENSE':
      deleteExpense(gameState, data);
      break;
  }
  
  // 廣播更新
  room.broadcast({
    type: 'EXPENSE_ACTION_UPDATED',
    payload: { action, gameState }
  }, ws);
}

// 同步遊戲狀態
function syncGameState(ws, gameId) {
  const room = gameRooms.get(gameId);
  if (room && room.gameState) {
    ws.send(JSON.stringify({
      type: 'GAME_STATE_SYNC',
      payload: room.gameState
    }));
  }
}

// 輔助函數
function updatePlayerBuyIn(gameState, playerId, data) {
  const player = gameState.players.find(p => p.id === playerId);
  if (player) {
    player.buyIn = data.amount;
    player.status = 'active';
  }
}

function updatePlayerCashOut(gameState, playerId, data) {
  const player = gameState.players.find(p => p.id === playerId);
  if (player) {
    player.profit = data.profit;
    player.status = 'cashed_out';
  }
}

function updatePlayerProfit(gameState, playerId, data) {
  const player = gameState.players.find(p => p.id === playerId);
  if (player) {
    player.profit = data.profit;
  }
}

function addInsurance(gameState, data) {
  gameState.insurances.push({
    id: Date.now().toString(),
    ...data,
    timestamp: Date.now()
  });
}

function addRake(gameState, data) {
  gameState.rakes.push({
    id: Date.now().toString(),
    ...data,
    timestamp: Date.now()
  });
}

function addExpense(gameState, data) {
  gameState.expenses.push({
    id: Date.now().toString(),
    ...data,
    timestamp: Date.now()
  });
}

function updateExpense(gameState, data) {
  const index = gameState.expenses.findIndex(e => e.id === data.id);
  if (index !== -1) {
    gameState.expenses[index] = { ...gameState.expenses[index], ...data };
  }
}

function deleteExpense(gameState, data) {
  gameState.expenses = gameState.expenses.filter(e => e.id !== data.id);
}

// 啟動服務器
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`WebSocket 服務器運行在端口 ${PORT}`);
});

module.exports = { server, wss };






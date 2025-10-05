import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { useGame } from './GameContext';
import { useWebSocket } from '../hooks/useWebSocket';

interface CollaborationState {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  activeUsers: string[];
  lastSyncTime: number | null;
  conflictResolution: 'auto' | 'manual';
  isOnline: boolean;
  editors: string[]; // 新增：以 email 表示的協作者名單
}

type CollaborationAction =
  | { type: 'SET_CONNECTION_STATUS'; payload: 'connecting' | 'connected' | 'disconnected' | 'error' }
  | { type: 'SET_ACTIVE_USERS'; payload: string[] }
  | { type: 'SET_LAST_SYNC_TIME'; payload: number }
  | { type: 'SET_CONFLICT_RESOLUTION'; payload: 'auto' | 'manual' }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'RESET_COLLABORATION' }
  | { type: 'ADD_EDITOR'; payload: string }
  | { type: 'REMOVE_EDITOR'; payload: string };

const initialState: CollaborationState = {
  isConnected: false,
  connectionStatus: 'disconnected',
  activeUsers: [],
  lastSyncTime: null,
  conflictResolution: 'auto',
  // 在 React Native 環境中不使用 navigator/onLine，改由 NetInfo 之後接管
  isOnline: true,
  editors: [],
};

function collaborationReducer(state: CollaborationState, action: CollaborationAction): CollaborationState {
  switch (action.type) {
    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.payload, isConnected: action.payload === 'connected' };
    case 'SET_ACTIVE_USERS':
      return { ...state, activeUsers: action.payload };
    case 'SET_LAST_SYNC_TIME':
      return { ...state, lastSyncTime: action.payload };
    case 'SET_CONFLICT_RESOLUTION':
      return { ...state, conflictResolution: action.payload };
    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload };
    case 'ADD_EDITOR':
      if (state.editors.includes(action.payload)) return state;
      return { ...state, editors: [...state.editors, action.payload] };
    case 'REMOVE_EDITOR':
      return { ...state, editors: state.editors.filter(e => e !== action.payload) };
    case 'RESET_COLLABORATION':
      return initialState;
    default:
      return state;
  }
}

interface CollaborationContextType {
  state: CollaborationState;
  // WebSocket 方法
  updateGameState: (gameState: any) => void;
  sendPlayerAction: (action: any) => void;
  sendExpenseAction: (action: any) => void;
  requestSync: () => void;
  // 協作方法
  setConflictResolution: (mode: 'auto' | 'manual') => void;
  resolveConflict: (localState: any, remoteState: any) => any;
  // 新增：邀請/編輯者管理
  addEditorByEmail: (email: string) => boolean;
  removeEditorByEmail: (email: string) => void;
  generateInviteLink: (gameId?: string) => string;
  // 狀態管理
  dispatch: React.Dispatch<CollaborationAction>;
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
};

interface CollaborationProviderProps {
  children: React.ReactNode;
  gameId?: string;
  websocketUrl?: string;
  enableWebSocket?: boolean;
}

export const CollaborationProvider: React.FC<CollaborationProviderProps> = ({
  children,
  gameId = "default-game",
  websocketUrl = 'ws://192.168.79.3:3001',
  enableWebSocket = false
}) => {
  // 根據平台調整 WebSocket URL
  const getWebSocketUrl = () => {
    if (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost') {
      return 'ws://localhost:3001';
    }
    return websocketUrl;
  };
  const [state, dispatch] = useReducer(collaborationReducer, initialState);
  const { state: gameState } = useGame();
  
  // 使用當前遊戲ID或提供的遊戲ID
  const currentGameId = gameState.currentGame?.id || gameId;

  // 處理 WebSocket 消息
  const handleWebSocketMessage = useCallback((message: any) => {
    console.log('收到協作消息:', message);
    
    switch (message.type) {
      case 'GAME_STATE_SYNC':
        // 同步遊戲狀態
        if (message.payload) {
          dispatch({ type: 'SET_LAST_SYNC_TIME', payload: Date.now() });
        }
        break;
        
      case 'GAME_STATE_UPDATED':
        // 其他用戶更新了遊戲狀態
        if (message.payload) {
          if (state.conflictResolution === 'auto') {
            // 自動合併 - 這裡需要重新實現
            console.log('自動合併遊戲狀態');
          } else {
            // 手動解決衝突
            console.log('需要手動解決衝突');
          }
          dispatch({ type: 'SET_LAST_SYNC_TIME', payload: Date.now() });
        }
        break;
        
      case 'PLAYER_ACTION_UPDATED':
        // 其他用戶執行了玩家操作
        if (message.payload) {
          const { action, gameState: updatedGameState } = message.payload;
          console.log('玩家操作更新:', action);
          dispatch({ type: 'SET_LAST_SYNC_TIME', payload: Date.now() });
        }
        break;
        
      case 'EXPENSE_ACTION_UPDATED':
        // 其他用戶執行了支出操作
        if (message.payload) {
          const { action, gameState: updatedGameState } = message.payload;
          console.log('支出操作更新:', action);
          dispatch({ type: 'SET_LAST_SYNC_TIME', payload: Date.now() });
        }
        break;
        
      case 'USER_JOINED':
        // 新用戶加入
        if (message.payload?.userId) {
          dispatch({ 
            type: 'SET_ACTIVE_USERS', 
            payload: [...state.activeUsers, message.payload.userId] 
          });
        }
        break;
        
      case 'USER_LEFT':
        // 用戶離開
        if (message.payload?.userId) {
          dispatch({ 
            type: 'SET_ACTIVE_USERS', 
            payload: state.activeUsers.filter(id => id !== message.payload.userId) 
          });
        }
        break;
    }
  }, [state.activeUsers, state.conflictResolution]);

  // WebSocket 連接狀態處理
  const handleConnect = useCallback(() => {
    console.log('協作連接已建立');
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' });
  }, []);

  const handleDisconnect = useCallback(() => {
    console.log('協作連接已斷開');
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'disconnected' });
  }, []);

  const handleError = useCallback((error: Event) => {
    console.error('協作連接錯誤:', error);
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'error' });
  }, []);

  // 使用 useWebSocket hook
  const {
    isConnected: wsConnected,
    connectionStatus: wsStatus,
    updateGameState: wsUpdateGameState,
    sendPlayerAction: wsSendPlayerAction,
    sendExpenseAction: wsSendExpenseAction,
    requestSync: wsRequestSync
  } = useWebSocket({
    url: getWebSocketUrl(),
    gameId: currentGameId,
    onMessage: handleWebSocketMessage,
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
    onError: handleError,
    enabled: enableWebSocket
  });

  // 初始化 WebSocket：可開關控制，關閉時使用安全 stub
  const isConnected = enableWebSocket ? state.connectionStatus === 'connected' : false;
  const connectionStatus = enableWebSocket ? state.connectionStatus : 'disconnected';

  const updateGameState = useCallback((gs?: any) => {
    if (!enableWebSocket) {
      console.log('協作關閉：略過更新');
      return;
    }
    try {
      wsUpdateGameState(gs);
      console.log('協作：更新遊戲狀態', !!gs);
    } catch (err) {
      console.error('協作更新失敗:', err);
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'error' });
    }
  }, [enableWebSocket, wsUpdateGameState]);

  const sendPlayerAction = useCallback((action?: any) => {
    if (!enableWebSocket) return;
    try {
      wsSendPlayerAction(action);
      console.log('協作：玩家操作', action?.type || 'unknown');
    } catch (err) {
      console.error('協作玩家操作失敗:', err);
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'error' });
    }
  }, [enableWebSocket, wsSendPlayerAction]);

  const sendExpenseAction = useCallback((action?: any) => {
    if (!enableWebSocket) return;
    try {
      wsSendExpenseAction(action);
      console.log('協作：支出操作', action?.type || 'unknown');
    } catch (err) {
      console.error('協作支出操作失敗:', err);
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'error' });
    }
  }, [enableWebSocket, wsSendExpenseAction]);

  const requestSync = useCallback(() => {
    if (!enableWebSocket) return;
    try {
      wsRequestSync();
      console.log('協作：請求同步');
    } catch (err) {
      console.error('協作請求同步失敗:', err);
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'error' });
    }
  }, [enableWebSocket, wsRequestSync]);

  // 監聽網絡狀態 (React Native 使用 NetInfo)
  useEffect(() => {
    // 在 React Native 中，我們使用 NetInfo 來監聽網絡狀態
    // 這裡先設置為在線狀態，後續可以集成 NetInfo
    dispatch({ type: 'SET_ONLINE_STATUS', payload: true });
  }, []);

  // 同步 WebSocket 狀態到本地狀態
  useEffect(() => {
    if (enableWebSocket) {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: wsStatus });
    } else {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'disconnected' });
    }
  }, [enableWebSocket, wsStatus]);

  // 協作方法
  const setConflictResolution = useCallback((mode: 'auto' | 'manual') => {
    dispatch({ type: 'SET_CONFLICT_RESOLUTION', payload: mode });
  }, []);

  const resolveConflict = useCallback((localState: any, remoteState: any) => {
    // 簡單的衝突解決策略：使用時間戳較新的版本
    if (remoteState.lastModified > localState.lastModified) {
      return remoteState;
    }
    return localState;
  }, []);

  // 新增：邀請/編輯者管理（先本地實作，之後可接後端）
  const addEditorByEmail = useCallback((email: string) => {
    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      return false;
    }
    dispatch({ type: 'ADD_EDITOR', payload: normalized });
    return true;
  }, []);

  const removeEditorByEmail = useCallback((email: string) => {
    dispatch({ type: 'REMOVE_EDITOR', payload: email.trim().toLowerCase() });
  }, []);

  const generateInviteLink = useCallback((gid?: string) => {
    const id = gid || currentGameId || 'default-game';
    // 深連結 schema（之後可換為正式域名）
    return `pokerhost://join/${id}`;
  }, [currentGameId]);

  const contextValue: CollaborationContextType = useMemo(() => ({
    state,
    updateGameState,
    sendPlayerAction,
    sendExpenseAction,
    requestSync,
    setConflictResolution,
    resolveConflict,
    addEditorByEmail,
    removeEditorByEmail,
    generateInviteLink,
    dispatch
  }), [state, updateGameState, sendPlayerAction, sendExpenseAction, requestSync, setConflictResolution, resolveConflict, addEditorByEmail, removeEditorByEmail, generateInviteLink, dispatch]);

  return (
    <CollaborationContext.Provider value={contextValue}>
      {children}
    </CollaborationContext.Provider>
  );
};

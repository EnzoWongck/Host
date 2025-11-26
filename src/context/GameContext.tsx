import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Game, Player, Dealer, Expense, Rake, Insurance, InsurancePartner, BuyInEntry } from '../types/game';

interface GameState {
  games: Game[];
  currentGame: Game | null;
  loading: boolean;
  error: string | null;
  gameSummaryModalVisible: boolean;
}

type GameAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_GAMES'; payload: Game[] }
  | { type: 'SET_CURRENT_GAME'; payload: Game | null }
  | { type: 'ADD_GAME'; payload: Game }
  | { type: 'UPDATE_GAME'; payload: Game }
  | { type: 'ADD_PLAYER'; payload: { gameId: string; player: Player } }
  | { type: 'UPDATE_PLAYER'; payload: { gameId: string; player: Player } }
  | { type: 'DELETE_PLAYER'; payload: { gameId: string; playerId: string } }
  | { type: 'ADD_BUYIN'; payload: { gameId: string; playerId: string; entry: BuyInEntry } }
  | { type: 'UPDATE_BUYIN'; payload: { gameId: string; playerId: string; entry: BuyInEntry } }
  | { type: 'DELETE_BUYIN'; payload: { gameId: string; playerId: string; entryId: string } }
  | { type: 'ADD_DEALER'; payload: { gameId: string; dealer: Dealer } }
  | { type: 'UPDATE_DEALER'; payload: { gameId: string; dealer: Dealer } }
  | { type: 'DELETE_DEALER'; payload: { gameId: string; dealerId: string } }
  | { type: 'ADD_EXPENSE'; payload: { gameId: string; expense: Expense } }
  | { type: 'UPDATE_EXPENSE'; payload: { gameId: string; expense: Expense } }
  | { type: 'DELETE_EXPENSE'; payload: { gameId: string; expenseId: string } }
  | { type: 'ADD_RAKE'; payload: { gameId: string; rake: Rake } }
  | { type: 'UPDATE_RAKE'; payload: { gameId: string; rake: Rake } }
  | { type: 'DELETE_RAKE'; payload: { gameId: string; rakeId: string } }
  | { type: 'ADD_INSURANCE'; payload: { gameId: string; insurance: Insurance } }
  | { type: 'UPDATE_INSURANCE'; payload: { gameId: string; insurance: Insurance } }
  | { type: 'DELETE_INSURANCE'; payload: { gameId: string; insuranceId: string } }
  | { type: 'SET_GAME_SUMMARY_MODAL_VISIBLE'; payload: boolean }
  | { type: 'SYNC_GAME_STATE'; payload: Game }
  | { type: 'MERGE_GAME_STATE'; payload: { local: Game; remote: Game } };

const initialState: GameState = {
  games: [],
  currentGame: null,
  loading: false,
  error: null,
  gameSummaryModalVisible: false,
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_GAMES':
      return { ...state, games: action.payload };
    case 'SET_CURRENT_GAME':
      return { ...state, currentGame: action.payload };
    case 'ADD_GAME':
      return { 
        ...state, 
        games: [action.payload, ...state.games],
        currentGame: action.payload 
      };
    case 'UPDATE_GAME':
      return {
        ...state,
        games: state.games.map(game => 
          game.id === action.payload.id ? action.payload : game
        ),
        currentGame: state.currentGame?.id === action.payload.id 
          ? action.payload 
          : state.currentGame,
      };
    case 'ADD_PLAYER':
      return {
        ...state,
        games: state.games.map(game =>
          game.id === action.payload.gameId
            ? { ...game, players: [...game.players, action.payload.player] }
            : game
        ),
        currentGame: state.currentGame?.id === action.payload.gameId
          ? { ...state.currentGame, players: [...state.currentGame.players, action.payload.player] }
          : state.currentGame,
      };
    case 'UPDATE_PLAYER':
      return {
        ...state,
        games: state.games.map(game =>
          game.id === action.payload.gameId
            ? { 
                ...game, 
                players: game.players.map(player => 
                  player.id === action.payload.player.id ? action.payload.player : player
                )
              }
            : game
        ),
        currentGame: state.currentGame?.id === action.payload.gameId
          ? { 
              ...state.currentGame, 
              players: state.currentGame.players.map(player => 
                player.id === action.payload.player.id ? action.payload.player : player
              )
            }
          : state.currentGame,
      };
    case 'DELETE_PLAYER':
      return {
        ...state,
        games: state.games.map(game =>
          game.id === action.payload.gameId
            ? { ...game, players: game.players.filter(p => p.id !== action.payload.playerId) }
            : game
        ),
        currentGame: state.currentGame?.id === action.payload.gameId
          ? { ...state.currentGame, players: state.currentGame.players.filter(p => p.id !== action.payload.playerId) }
          : state.currentGame,
      };
    case 'ADD_BUYIN': {
      const updatePlayers = (players: Player[]) => players.map(p => {
        if (p.id !== action.payload.playerId) return p;
        const buyIns = [...(p.buyIns || []), action.payload.entry];
        const buyIn = buyIns.reduce((s, e) => s + e.amount, 0);
        const profit = p.status === 'active' ? -buyIn : p.profit;
        // 如果還沒有 buyInTime，設置為第一筆買入的時間
        const buyInTime = p.buyInTime || action.payload.entry.timestamp;
        return { ...p, buyIns, buyIn, profit, buyInTime, updatedAt: new Date() };
      });
      return {
        ...state,
        games: state.games.map(g => g.id === action.payload.gameId ? { ...g, players: updatePlayers(g.players) } : g),
        currentGame: state.currentGame?.id === action.payload.gameId ? { ...state.currentGame, players: updatePlayers(state.currentGame.players) } : state.currentGame,
      };
    }
    case 'UPDATE_BUYIN': {
      const updatePlayers = (players: Player[]) => players.map(p => {
        if (p.id !== action.payload.playerId) return p;
        const buyIns = (p.buyIns || []).map(e => e.id === action.payload.entry.id ? action.payload.entry : e);
        const buyIn = buyIns.reduce((s, e) => s + e.amount, 0);
        const profit = p.status === 'active' ? -buyIn : p.profit;
        return { ...p, buyIns, buyIn, profit, updatedAt: new Date() };
      });
      return {
        ...state,
        games: state.games.map(g => g.id === action.payload.gameId ? { ...g, players: updatePlayers(g.players) } : g),
        currentGame: state.currentGame?.id === action.payload.gameId ? { ...state.currentGame, players: updatePlayers(state.currentGame.players) } : state.currentGame,
      };
    }
    case 'DELETE_BUYIN': {
      const updatePlayers = (players: Player[]) => {
        return players
          .map(p => {
            if (p.id !== action.payload.playerId) return p;
            const buyIns = (p.buyIns || []).filter(e => e.id !== action.payload.entryId);
            // 如果刪除後沒有任何買入記錄，返回 null 標記需要刪除
            if (buyIns.length === 0) return null;
            const buyIn = buyIns.reduce((s, e) => s + e.amount, 0);
            const profit = p.status === 'active' ? -buyIn : p.profit;
            return { ...p, buyIns, buyIn, profit, updatedAt: new Date() };
          })
          .filter((p): p is Player => p !== null); // 過濾掉 null，即刪除沒有買入記錄的玩家
      };
      return {
        ...state,
        games: state.games.map(g => g.id === action.payload.gameId ? { ...g, players: updatePlayers(g.players) } : g),
        currentGame: state.currentGame?.id === action.payload.gameId ? { ...state.currentGame, players: updatePlayers(state.currentGame.players) } : state.currentGame,
      };
    }
    case 'ADD_DEALER':
      return {
        ...state,
        games: state.games.map(game =>
          game.id === action.payload.gameId
            ? { ...game, dealers: [...game.dealers, action.payload.dealer] }
            : game
        ),
        currentGame: state.currentGame?.id === action.payload.gameId
          ? { ...state.currentGame, dealers: [...state.currentGame.dealers, action.payload.dealer] }
          : state.currentGame,
      };
    case 'UPDATE_DEALER':
      return {
        ...state,
        games: state.games.map(game =>
          game.id === action.payload.gameId
            ? { 
                ...game, 
                dealers: game.dealers.map(dealer => 
                  dealer.id === action.payload.dealer.id ? action.payload.dealer : dealer
                )
              }
            : game
        ),
        currentGame: state.currentGame?.id === action.payload.gameId
          ? { 
              ...state.currentGame, 
              dealers: state.currentGame.dealers.map(dealer => 
                dealer.id === action.payload.dealer.id ? action.payload.dealer : dealer
              )
            }
          : state.currentGame,
      };
    case 'DELETE_DEALER':
      return {
        ...state,
        games: state.games.map(game =>
          game.id === action.payload.gameId
            ? { 
                ...game, 
                dealers: game.dealers.filter(dealer => dealer.id !== action.payload.dealerId)
              }
            : game
        ),
        currentGame: state.currentGame?.id === action.payload.gameId
          ? { 
              ...state.currentGame, 
              dealers: state.currentGame.dealers.filter(dealer => dealer.id !== action.payload.dealerId)
            }
          : state.currentGame,
      };
    case 'ADD_EXPENSE':
      return {
        ...state,
        games: state.games.map(game =>
          game.id === action.payload.gameId
            ? { ...game, expenses: [...game.expenses, action.payload.expense] }
            : game
        ),
        currentGame: state.currentGame?.id === action.payload.gameId
          ? { ...state.currentGame, expenses: [...state.currentGame.expenses, action.payload.expense] }
          : state.currentGame,
      };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        games: state.games.map(game =>
          game.id === action.payload.gameId
            ? { ...game, expenses: game.expenses.map(e => e.id === action.payload.expense.id ? action.payload.expense : e) }
            : game
        ),
        currentGame: state.currentGame?.id === action.payload.gameId
          ? { ...state.currentGame, expenses: state.currentGame.expenses.map(e => e.id === action.payload.expense.id ? action.payload.expense : e) }
          : state.currentGame,
      };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        games: state.games.map(game =>
          game.id === action.payload.gameId
            ? { ...game, expenses: game.expenses.filter(e => e.id !== action.payload.expenseId) }
            : game
        ),
        currentGame: state.currentGame?.id === action.payload.gameId
          ? { ...state.currentGame, expenses: state.currentGame.expenses.filter(e => e.id !== action.payload.expenseId) }
          : state.currentGame,
      };
    case 'ADD_RAKE':
      return {
        ...state,
        games: state.games.map(game =>
          game.id === action.payload.gameId
            ? { ...game, rakes: [...game.rakes, action.payload.rake] }
            : game
        ),
        currentGame: state.currentGame?.id === action.payload.gameId
          ? { ...state.currentGame, rakes: [...state.currentGame.rakes, action.payload.rake] }
          : state.currentGame,
      };
    case 'UPDATE_RAKE':
      return {
        ...state,
        games: state.games.map(game =>
          game.id === action.payload.gameId
            ? { ...game, rakes: game.rakes.map(r => r.id === action.payload.rake.id ? action.payload.rake : r) }
            : game
        ),
        currentGame: state.currentGame?.id === action.payload.gameId
          ? { ...state.currentGame, rakes: state.currentGame.rakes.map(r => r.id === action.payload.rake.id ? action.payload.rake : r) }
          : state.currentGame,
      };
    case 'DELETE_RAKE':
      return {
        ...state,
        games: state.games.map(game =>
          game.id === action.payload.gameId
            ? { ...game, rakes: game.rakes.filter(r => r.id !== action.payload.rakeId) }
            : game
        ),
        currentGame: state.currentGame?.id === action.payload.gameId
          ? { ...state.currentGame, rakes: state.currentGame.rakes.filter(r => r.id !== action.payload.rakeId) }
          : state.currentGame,
      };
    case 'ADD_INSURANCE':
      return {
        ...state,
        games: state.games.map(game =>
          game.id === action.payload.gameId
            ? { ...game, insurances: [...game.insurances, action.payload.insurance] }
            : game
        ),
        currentGame: state.currentGame?.id === action.payload.gameId
          ? { ...state.currentGame, insurances: [...state.currentGame.insurances, action.payload.insurance] }
          : state.currentGame,
      };
    case 'UPDATE_INSURANCE':
      return {
        ...state,
        games: state.games.map(game =>
          game.id === action.payload.gameId
            ? { ...game, insurances: game.insurances.map(i => i.id === action.payload.insurance.id ? action.payload.insurance : i) }
            : game
        ),
        currentGame: state.currentGame?.id === action.payload.gameId
          ? { ...state.currentGame, insurances: state.currentGame.insurances.map(i => i.id === action.payload.insurance.id ? action.payload.insurance : i) }
          : state.currentGame,
      };
    case 'DELETE_INSURANCE':
      return {
        ...state,
        games: state.games.map(game =>
          game.id === action.payload.gameId
            ? { ...game, insurances: game.insurances.filter(i => i.id !== action.payload.insuranceId) }
            : game
        ),
        currentGame: state.currentGame?.id === action.payload.gameId
          ? { ...state.currentGame, insurances: state.currentGame.insurances.filter(i => i.id !== action.payload.insuranceId) }
          : state.currentGame,
      };
    case 'SET_GAME_SUMMARY_MODAL_VISIBLE':
      return { ...state, gameSummaryModalVisible: action.payload };
    case 'SYNC_GAME_STATE':
      // 同步遠程遊戲狀態
      const syncedGame = action.payload;
      return {
        ...state,
        games: state.games.map(game => 
          game.id === syncedGame.id ? syncedGame : game
        ),
        currentGame: state.currentGame?.id === syncedGame.id ? syncedGame : state.currentGame,
      };
    case 'MERGE_GAME_STATE':
      // 合併本地和遠程遊戲狀態
      const { local, remote } = action.payload;
      const mergedGame = {
        ...local,
        // 使用遠程的更新時間戳
        lastModified: Math.max(local.lastModified || 0, remote.lastModified || 0),
        // 合併玩家數據（保留本地未保存的更改）
        players: local.players.map(localPlayer => {
          const remotePlayer = remote.players.find(p => p.id === localPlayer.id);
          if (remotePlayer) {
            // 如果遠程玩家有更新，使用遠程數據
            return remotePlayer.lastModified > localPlayer.lastModified ? remotePlayer : localPlayer;
          }
          return localPlayer;
        }),
        // 合併其他數據
        expenses: remote.expenses,
        rakes: remote.rakes,
        insurances: remote.insurances,
        dealers: remote.dealers,
      };
      return {
        ...state,
        games: state.games.map(game => 
          game.id === mergedGame.id ? mergedGame : game
        ),
        currentGame: state.currentGame?.id === mergedGame.id ? mergedGame : state.currentGame,
      };
    default:
      return state;
  }
};

interface GameContextType {
  state: GameState;
  createGame: (gameData: Omit<Game, 'id' | 'players' | 'dealers' | 'expenses' | 'rakes' | 'insurances' | 'totalBuyIn' | 'totalCashOut' | 'totalRake' | 'totalTips' | 'totalExpenses' | 'dealerSalaries' | 'netProfit'>) => void;
  endGame: (gameId: string, endData: { endTime: Date; actualCollection: number; finalNotes?: string }) => void;
  selectCurrentGame: (gameId: string) => void;
  updateGame: (game: Game) => void;
  addPlayer: (gameId: string, playerData: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePlayer: (gameId: string, player: Player) => void;
  deletePlayer: (gameId: string, playerId: string) => void;
  addBuyInEntry: (gameId: string, playerId: string, amount: number, timestamp?: Date) => void;
  updateBuyInEntry: (gameId: string, playerId: string, entry: BuyInEntry) => void;
  deleteBuyInEntry: (gameId: string, playerId: string, entryId: string) => void;
  addDealer: (gameId: string, dealerData: Omit<Dealer, 'id' | 'totalTips' | 'estimatedSalary'>) => void;
  updateDealer: (gameId: string, dealer: Dealer) => void;
  deleteDealer: (gameId: string, dealerId: string) => void;
  addExpense: (gameId: string, expenseData: Omit<Expense, 'id' | 'timestamp'>) => void;
  updateExpense: (gameId: string, expense: Expense) => void;
  deleteExpense: (gameId: string, expenseId: string) => void;
  addRake: (gameId: string, rakeData: Omit<Rake, 'id' | 'timestamp'>) => void;
  updateRake: (gameId: string, rake: Rake) => void;
  deleteRake: (gameId: string, rakeId: string) => void;
  addInsurance: (gameId: string, insuranceData: Omit<Insurance, 'id' | 'timestamp'>) => void;
  updateInsurance: (gameId: string, insurance: Insurance) => void;
  deleteInsurance: (gameId: string, insuranceId: string) => void;
  setDefaultInsurancePartners: (gameId: string, partners: InsurancePartner[]) => void;
  loadGames: () => void;
  setGameSummaryModalVisible: (visible: boolean) => void;
  deleteGame: (gameId: string) => void;
  reorderGames: (orderedIds: string[]) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const saveToStorage = async (games: Game[]) => {
    try {
      await AsyncStorage.setItem('pokerGames', JSON.stringify(games));
    } catch (error) {
      console.error('Error saving games:', error);
    }
  };

  const loadGames = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const stored = await AsyncStorage.getItem('pokerGames');
      if (stored) {
        const games = JSON.parse(stored);
        dispatch({ type: 'SET_GAMES', payload: games });
        const currentGameStored = await AsyncStorage.getItem('currentGame');
        if (currentGameStored) {
          dispatch({ type: 'SET_CURRENT_GAME', payload: JSON.parse(currentGameStored) });
        }
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load games' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createGame = (gameData: Omit<Game, 'id' | 'players' | 'dealers' | 'expenses' | 'rakes' | 'insurances' | 'totalBuyIn' | 'totalCashOut' | 'totalRake' | 'totalTips' | 'totalExpenses' | 'dealerSalaries' | 'netProfit'>) => {
    const newGame: Game = {
      ...gameData,
      id: Date.now().toString(),
      players: [],
      dealers: [],
      expenses: [],
      rakes: [],
      insurances: [],
      totalBuyIn: 0,
      totalCashOut: 0,
      totalRake: 0,
      totalTips: 0,
      totalExpenses: 0,
      dealerSalaries: 0,
      netProfit: 0,
    };
    
    dispatch({ type: 'ADD_GAME', payload: newGame });
    const updatedGames = [newGame, ...state.games];
    saveToStorage(updatedGames);
    AsyncStorage.setItem('currentGame', JSON.stringify(newGame));
  };

  const selectCurrentGame = (gameId: string) => {
    const game = state.games.find(g => g.id === gameId) || null;
    dispatch({ type: 'SET_CURRENT_GAME', payload: game });
    if (game) AsyncStorage.setItem('currentGame', JSON.stringify(game));
  };

  const updateGame = (game: Game) => {
    dispatch({ type: 'UPDATE_GAME', payload: game });
    const updatedGames = state.games.map(g => g.id === game.id ? game : g);
    saveToStorage(updatedGames);
    if (state.currentGame?.id === game.id) {
      AsyncStorage.setItem('currentGame', JSON.stringify(game));
    }
  };

  const addPlayer = (gameId: string, playerData: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newPlayer: Player = {
      ...playerData,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
      buyInTime: now, // 記錄買入時間
      buyIns: playerData.buyIns || (playerData.buyIn ? [{ id: (Date.now()+1).toString(), amount: playerData.buyIn, timestamp: now }] : []),
    };
    
    dispatch({ type: 'ADD_PLAYER', payload: { gameId, player: newPlayer } });
  };

  // Implement other functions...
  const updatePlayer = (gameId: string, player: Player) => {
    dispatch({ type: 'UPDATE_PLAYER', payload: { gameId, player } });
  };

  const deletePlayer = (gameId: string, playerId: string) => {
    dispatch({ type: 'DELETE_PLAYER', payload: { gameId, playerId } });
  };

  const addBuyInEntry = (gameId: string, playerId: string, amount: number, timestamp?: Date) => {
    const entry: BuyInEntry = { id: Date.now().toString(), amount, timestamp: timestamp || new Date() };
    dispatch({ type: 'ADD_BUYIN', payload: { gameId, playerId, entry } });
  };

  const updateBuyInEntry = (gameId: string, playerId: string, entry: BuyInEntry) => {
    dispatch({ type: 'UPDATE_BUYIN', payload: { gameId, playerId, entry } });
  };

  const deleteBuyInEntry = (gameId: string, playerId: string, entryId: string) => {
    dispatch({ type: 'DELETE_BUYIN', payload: { gameId, playerId, entryId } });
  };

  const addDealer = (gameId: string, dealerData: Omit<Dealer, 'id' | 'totalTips' | 'estimatedSalary'>) => {
    const newDealer: Dealer = {
      ...dealerData,
      id: Date.now().toString(),
      totalTips: 0,
      estimatedSalary: 0,
    };
    
    dispatch({ type: 'ADD_DEALER', payload: { gameId, dealer: newDealer } });
  };

  const updateDealer = (gameId: string, dealer: Dealer) => {
    dispatch({ type: 'UPDATE_DEALER', payload: { gameId, dealer } });
  };

  const deleteDealer = (gameId: string, dealerId: string) => {
    dispatch({ type: 'DELETE_DEALER', payload: { gameId, dealerId } });
  };

  const addExpense = (gameId: string, expenseData: Omit<Expense, 'id' | 'timestamp'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    
    dispatch({ type: 'ADD_EXPENSE', payload: { gameId, expense: newExpense } });
  };

  const updateExpense = (gameId: string, expense: Expense) => {
    dispatch({ type: 'UPDATE_EXPENSE', payload: { gameId, expense } });
  };

  const deleteExpense = (gameId: string, expenseId: string) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: { gameId, expenseId } });
  };

  const addRake = (gameId: string, rakeData: Omit<Rake, 'id' | 'timestamp'>) => {
    const newRake: Rake = {
      ...rakeData,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    
    dispatch({ type: 'ADD_RAKE', payload: { gameId, rake: newRake } });
  };

  const updateRake = (gameId: string, rake: Rake) => {
    dispatch({ type: 'UPDATE_RAKE', payload: { gameId, rake } });
  };
  const deleteRake = (gameId: string, rakeId: string) => {
    dispatch({ type: 'DELETE_RAKE', payload: { gameId, rakeId } });
  };

  const addInsurance = (gameId: string, insuranceData: Omit<Insurance, 'id' | 'timestamp'>) => {
    const newInsurance: Insurance = {
      ...insuranceData,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    
    dispatch({ type: 'ADD_INSURANCE', payload: { gameId, insurance: newInsurance } });
  };

  const updateInsurance = (gameId: string, insurance: Insurance) => {
    dispatch({ type: 'UPDATE_INSURANCE', payload: { gameId, insurance } });
  };
  const deleteInsurance = (gameId: string, insuranceId: string) => {
    dispatch({ type: 'DELETE_INSURANCE', payload: { gameId, insuranceId } });
  };

  const setDefaultInsurancePartners = (gameId: string, partners: InsurancePartner[]) => {
    const game = state.games.find(g => g.id === gameId);
    if (!game) return;
    const updated: Game = { ...game, defaultInsurancePartners: partners };
    dispatch({ type: 'UPDATE_GAME', payload: updated });
  };

  const setGameSummaryModalVisible = (visible: boolean) => {
    dispatch({ type: 'SET_GAME_SUMMARY_MODAL_VISIBLE', payload: visible });
  };

  const deleteGame = (gameId: string) => {
    const updatedGames = state.games.filter((g) => g.id !== gameId);
    const newCurrent =
      state.currentGame && state.currentGame.id === gameId
        ? null
        : state.currentGame;

    dispatch({ type: 'SET_GAMES', payload: updatedGames });
    dispatch({ type: 'SET_CURRENT_GAME', payload: newCurrent });

    saveToStorage(updatedGames);
    if (newCurrent) {
      AsyncStorage.setItem('currentGame', JSON.stringify(newCurrent));
    } else {
      AsyncStorage.removeItem('currentGame');
    }
  };

  const reorderGames = (orderedIds: string[]) => {
    if (!orderedIds.length) return;
    const idSet = new Set(orderedIds);
    const reordered: Game[] = [
      ...orderedIds
        .map((id) => state.games.find((g) => g.id === id))
        .filter((g): g is Game => !!g),
      ...state.games.filter((g) => !idSet.has(g.id)),
    ];

    dispatch({ type: 'SET_GAMES', payload: reordered });
    saveToStorage(reordered);
  };

  const endGame = (gameId: string, endData: { endTime: Date; actualCollection: number; finalNotes?: string }) => {
    const game = state.games.find(g => g.id === gameId);
    if (!game) return;

    const updatedGame: Game = {
      ...game,
      endTime: endData.endTime,
      actualCollection: endData.actualCollection,
      finalNotes: endData.finalNotes,
      status: 'completed',
    };

    dispatch({ type: 'UPDATE_GAME', payload: updatedGame });
    
    // 清除當前牌局
    dispatch({ type: 'SET_CURRENT_GAME', payload: null });
    AsyncStorage.removeItem('currentGame');
    
    // 保存更新後的牌局列表
    const updatedGames = state.games.map(g => g.id === gameId ? updatedGame : g);
    saveToStorage(updatedGames);
  };

  useEffect(() => {
    loadGames();
  }, []);

  const contextValue: GameContextType = {
    state,
    createGame,
    endGame,
    selectCurrentGame,
    updateGame,
    addPlayer,
    updatePlayer,
    deletePlayer,
    addBuyInEntry,
    updateBuyInEntry,
    deleteBuyInEntry,
    addDealer,
    updateDealer,
    deleteDealer,
    addExpense,
    updateExpense,
    deleteExpense,
    addRake,
    updateRake,
    deleteRake,
    addInsurance,
    updateInsurance,
    deleteInsurance,
    setDefaultInsurancePartners,
    loadGames,
    setGameSummaryModalVisible,
    deleteGame,
    reorderGames,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, useRef } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../config/supabase';
import { useAuth } from './AuthContext';
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
            if (buyIns.length === 0) return null;
            const buyIn = buyIns.reduce((s, e) => s + e.amount, 0);
            const profit = p.status === 'active' ? -buyIn : p.profit;
            return { ...p, buyIns, buyIn, profit, updatedAt: new Date() };
          })
          .filter((p): p is Player => p !== null);
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
      const syncedGame = action.payload;
      return {
        ...state,
        games: state.games.map(game => 
          game.id === syncedGame.id ? syncedGame : game
        ),
        currentGame: state.currentGame?.id === syncedGame.id ? syncedGame : state.currentGame,
      };
    case 'MERGE_GAME_STATE':
      const { local, remote } = action.payload;
      const mergedGame = {
        ...local,
        lastModified: Math.max(local.lastModified || 0, remote.lastModified || 0),
        players: local.players.map(localPlayer => {
          const remotePlayer = remote.players.find(p => p.id === localPlayer.id);
          if (remotePlayer) {
            return remotePlayer.lastModified > localPlayer.lastModified ? remotePlayer : localPlayer;
          }
          return localPlayer;
        }),
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
  createGame: (gameData: Omit<Game, 'id' | 'players' | 'dealers' | 'expenses' | 'rakes' | 'insurances' | 'totalBuyIn' | 'totalCashOut' | 'totalRake' | 'totalTips' | 'totalExpenses' | 'dealerSalaries' | 'netProfit'>) => Promise<string | null>;
  endGame: (gameId: string, endData: { endTime: Date; actualCollection: number; finalNotes?: string }) => void;
  selectCurrentGame: (gameId: string) => void;
  updateGame: (game: Game) => void;
  addPlayer: (gameId: string, playerData: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePlayer: (gameId: string, player: Player) => void;
  deletePlayer: (gameId: string, playerId: string) => void;
  addBuyInEntry: (gameId: string, playerId: string, amount: number, timestamp?: Date) => Promise<void>;
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
  clearAllGames: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// ============================================
// Supabase 數據轉換函數
// ============================================

// 從 Supabase 獲取完整的遊戲數據（包含關聯表）
async function fetchGameWithRelations(gameId: string): Promise<Game | null> {
  const { data: gameData, error: gameError } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single();

  if (gameError || !gameData) return null;

  // 並行獲取所有關聯數據
  const [playersRes, dealersRes, expensesRes, rakesRes, insurancesRes] = await Promise.all([
    supabase.from('players').select('*').eq('game_id', gameId),
    supabase.from('dealers').select('*').eq('game_id', gameId),
    supabase.from('expenses').select('*').eq('game_id', gameId),
    supabase.from('rakes').select('*').eq('game_id', gameId),
    supabase.from('insurances').select('*').eq('game_id', gameId),
  ]);

  return transformSupabaseGame(
    gameData,
    playersRes.data || [],
    dealersRes.data || [],
    expensesRes.data || [],
    rakesRes.data || [],
    insurancesRes.data || []
  );
}

// 將 Supabase 數據轉換為前端 Game 對象
function transformSupabaseGame(
  gameData: any,
  players: any[],
  dealers: any[],
  expenses: any[],
  rakes: any[],
  insurances: any[]
): Game {
  return {
    id: gameData.id,
    name: gameData.name,
    hosts: gameData.hosts || [],
    smallBlind: gameData.small_blind || 0,
    bigBlind: gameData.big_blind || 0,
    startTime: new Date(gameData.start_time),
    endTime: gameData.end_time ? new Date(gameData.end_time) : undefined,
    status: gameData.status || 'active',
    actualCollection: gameData.actual_collection,
    finalNotes: gameData.final_notes,
    gameMode: gameData.game_mode || 'rake',
    entryFeeMode: gameData.entry_fee_mode,
    fixedEntryFee: gameData.fixed_entry_fee,
    hourlyRate: gameData.hourly_rate,
    defaultInsurancePartners: gameData.default_insurance_partners || [],
    players: players.map(p => ({
      id: p.id,
      name: p.name,
      buyIn: p.buy_in || 0,
      buyIns: p.buy_ins || [],
      profit: p.profit || 0,
      status: p.status || 'active',
      buyInTime: p.buy_in_time ? new Date(p.buy_in_time) : undefined,
      cashOutTime: p.cash_out_time ? new Date(p.cash_out_time) : undefined,
      cashOutAmount: p.cash_out_amount,
      entryFeeDeducted: p.entry_fee_deducted || false,
      customEntryFee: p.custom_entry_fee,
      createdAt: new Date(p.created_at),
      updatedAt: new Date(p.updated_at),
    })),
    dealers: dealers.map(d => ({
      id: d.id,
      name: d.name,
      tipShare: d.tip_share || 50,
      hourlyRate: d.hourly_rate || 0,
      workHours: d.work_hours || 0,
      startTime: d.start_time ? new Date(d.start_time) : undefined,
      endTime: d.end_time ? new Date(d.end_time) : undefined,
      status: d.status || 'working',
      totalTips: d.total_tips || 0,
      estimatedSalary: d.estimated_salary || 0,
      host: d.host,
    })),
    expenses: expenses.map(e => ({
      id: e.id,
      category: e.category,
      description: e.description,
      amount: e.amount,
      host: e.host,
      timestamp: new Date(e.timestamp),
    })),
    rakes: rakes.map(r => ({
      id: r.id,
      amount: r.amount,
      note: r.note,
      timestamp: new Date(r.timestamp),
    })),
    insurances: insurances.map(i => ({
      id: i.id,
      amount: i.amount,
      partners: i.partners || [],
      timestamp: new Date(i.timestamp),
    })),
    // 計算總買入
    totalBuyIn: players.reduce((sum, player) => sum + (player.buy_in || 0), 0),
    // 計算總兌現
    totalCashOut: players.reduce((sum, player) => {
      return sum + ((player.buy_in || 0) + (player.profit || 0));
    }, 0),
    // 計算總抽水
    totalRake: rakes.reduce((sum, rake) => sum + (rake.amount || 0), 0),
    // 計算總小費
    totalTips: dealers.reduce((sum, dealer) => sum + (dealer.total_tips || 0), 0),
    // 計算總支出
    totalExpenses: expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0),
    // 計算發牌員薪金
    dealerSalaries: dealers.reduce((sum, dealer) => {
      const tipPortion = (dealer.total_tips || 0) * ((dealer.tip_share || 50) / 100);
      const hourlyPortion = (dealer.hourly_rate || 0) * (dealer.work_hours || 0);
      const baseSalary = tipPortion + hourlyPortion;
      const salary = dealer.estimated_salary && dealer.estimated_salary > 0
        ? dealer.estimated_salary
        : baseSalary;
      return sum + salary;
    }, 0),
    // 計算淨利潤
    netProfit: (() => {
      const buyIn = players.reduce((sum, player) => sum + (player.buy_in || 0), 0);
      const cashOut = players.reduce((sum, player) => {
        return sum + ((player.buy_in || 0) + (player.profit || 0));
      }, 0);
      const rake = rakes.reduce((sum, rake) => sum + (rake.amount || 0), 0);
      const tips = dealers.reduce((sum, dealer) => sum + (dealer.total_tips || 0), 0);
      const expensesTotal = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      const dealerSalary = dealers.reduce((sum, dealer) => {
        const tipPortion = (dealer.total_tips || 0) * ((dealer.tip_share || 50) / 100);
        const hourlyPortion = (dealer.hourly_rate || 0) * (dealer.work_hours || 0);
        const baseSalary = tipPortion + hourlyPortion;
        const salary = dealer.estimated_salary && dealer.estimated_salary > 0
          ? dealer.estimated_salary
          : baseSalary;
        return sum + salary;
      }, 0);
      const insuranceProfit = insurances.reduce((sum, ins) => sum + (ins.amount || 0), 0);
      const revenue = gameData.game_mode === 'noRake' ? 0 : rake;
      return revenue + insuranceProfit - (cashOut - buyIn) - expensesTotal - dealerSalary;
    })(),
  };
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const stateRef = useRef(state);
  const { user } = useAuth();
  
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ============================================
  // 從 Supabase 加載遊戲
  // ============================================
  const loadGames = useCallback(async () => {
    if (!user?.uid) {
      dispatch({ type: 'SET_GAMES', payload: [] });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // 獲取用戶創建的遊戲
      const { data: ownGamesData, error: ownGamesError } = await supabase
        .from('games')
        .select('*')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false });

      if (ownGamesError) throw ownGamesError;

      // 獲取用戶作為協作者的遊戲
      const { data: collabData } = await supabase
        .from('game_collaborations')
        .select('game_id')
        .eq('collaborator_id', user.uid)
        .eq('status', 'accepted');
      
      let collabGamesData: any[] = [];
      if (collabData && collabData.length > 0) {
        const collabGameIds = collabData.map(c => c.game_id);
        const { data: collabGames } = await supabase
          .from('games')
          .select('*')
          .in('id', collabGameIds)
          .order('created_at', { ascending: false });
        collabGamesData = collabGames || [];
      }

      // 合併兩種遊戲（去重）
      const allGamesMap = new Map<string, any>();
      [...(ownGamesData || []), ...collabGamesData].forEach(game => {
        if (!allGamesMap.has(game.id)) {
          allGamesMap.set(game.id, game);
        }
      });
      const gamesData = Array.from(allGamesMap.values());

      if (gamesData.length === 0) {
        dispatch({ type: 'SET_GAMES', payload: [] });
        return;
      }

      // 獲取所有遊戲的關聯數據
      const gameIds = gamesData.map(g => g.id);
      
      const [playersRes, dealersRes, expensesRes, rakesRes, insurancesRes] = await Promise.all([
        supabase.from('players').select('*').in('game_id', gameIds),
        supabase.from('dealers').select('*').in('game_id', gameIds),
        supabase.from('expenses').select('*').in('game_id', gameIds),
        supabase.from('rakes').select('*').in('game_id', gameIds),
        supabase.from('insurances').select('*').in('game_id', gameIds),
      ]);

      // 組裝完整的遊戲數據
      const games: Game[] = gamesData.map(gameData => {
        const gamePlayers = (playersRes.data || []).filter(p => p.game_id === gameData.id);
        const gameDealers = (dealersRes.data || []).filter(d => d.game_id === gameData.id);
        const gameExpenses = (expensesRes.data || []).filter(e => e.game_id === gameData.id);
        const gameRakes = (rakesRes.data || []).filter(r => r.game_id === gameData.id);
        const gameInsurances = (insurancesRes.data || []).filter(i => i.game_id === gameData.id);

        return transformSupabaseGame(
          gameData,
          gamePlayers,
          gameDealers,
          gameExpenses,
          gameRakes,
          gameInsurances
        );
      });

      dispatch({ type: 'SET_GAMES', payload: games });

    } catch (error) {
      console.error('加載遊戲失敗:', error);
      dispatch({ type: 'SET_ERROR', payload: '載入遊戲失敗' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user?.uid]);

  // ============================================
  // 創建遊戲
  // ============================================
  const createGame = useCallback(async (gameData: Omit<Game, 'id' | 'players' | 'dealers' | 'expenses' | 'rakes' | 'insurances' | 'totalBuyIn' | 'totalCashOut' | 'totalRake' | 'totalTips' | 'totalExpenses' | 'dealerSalaries' | 'netProfit'>): Promise<string | null> => {
    if (!user?.uid) return null;

    try {
      const { data, error } = await supabase
        .from('games')
        .insert({
          user_id: user.uid,
          name: gameData.name,
          hosts: gameData.hosts || [],
          small_blind: gameData.smallBlind || 0,
          big_blind: gameData.bigBlind || 0,
          start_time: gameData.startTime || new Date(),
          status: 'active',
          game_mode: gameData.gameMode || 'rake',
          entry_fee_mode: gameData.entryFeeMode,
          fixed_entry_fee: gameData.fixedEntryFee,
          hourly_rate: gameData.hourlyRate,
          default_insurance_partners: gameData.defaultInsurancePartners || [],
        })
        .select()
        .single();

      if (error) throw error;

      const newGame: Game = {
        ...gameData,
        id: data.id,
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
      return data.id;
    } catch (error) {
      console.error('創建遊戲失敗:', error);
      dispatch({ type: 'SET_ERROR', payload: '創建遊戲失敗' });
      return null;
    }
  }, [user?.uid]);

  // ============================================
  // 更新遊戲
  // ============================================
  const updateGame = useCallback(async (game: Game) => {
    if (!user?.uid) return;

    try {
      const { error } = await supabase
        .from('games')
        .update({
          name: game.name,
          hosts: game.hosts,
          small_blind: game.smallBlind,
          big_blind: game.bigBlind,
          start_time: game.startTime,
          end_time: game.endTime,
          status: game.status,
          actual_collection: game.actualCollection,
          final_notes: game.finalNotes,
          game_mode: game.gameMode,
          entry_fee_mode: game.entryFeeMode,
          fixed_entry_fee: game.fixedEntryFee,
          hourly_rate: game.hourlyRate,
          default_insurance_partners: game.defaultInsurancePartners,
        })
        .eq('id', game.id);

      if (error) throw error;

      dispatch({ type: 'UPDATE_GAME', payload: game });
    } catch (error) {
      console.error('更新遊戲失敗:', error);
    }
  }, [user?.uid]);

  // ============================================
  // 選擇當前遊戲
  // ============================================
  const selectCurrentGame = useCallback((gameId: string) => {
    const game = stateRef.current.games.find(g => g.id === gameId) || null;
    dispatch({ type: 'SET_CURRENT_GAME', payload: game });
  }, []);

  // ============================================
  // 玩家操作
  // ============================================
  const addPlayer = useCallback(async (gameId: string, playerData: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    if (!user?.uid) {
      throw new Error('用戶未登入');
    }

    try {
      const now = new Date();
      const { data, error } = await supabase
        .from('players')
        .insert({
          game_id: gameId,
          name: playerData.name,
          buy_in: playerData.buyIn || 0,
          buy_ins: playerData.buyIns || (playerData.buyIn ? [{ id: crypto.randomUUID(), amount: playerData.buyIn, timestamp: now }] : []),
          profit: playerData.profit || 0,
          status: playerData.status || 'active',
          buy_in_time: now,
        })
        .select()
        .single();

      if (error) {
        console.error('添加玩家數據庫錯誤:', error);
        throw error;
      }

      const newPlayer: Player = {
        ...playerData,
        id: data.id,
        createdAt: now,
        updatedAt: now,
        buyInTime: now,
        buyIns: data.buy_ins || [],
      };

      dispatch({ type: 'ADD_PLAYER', payload: { gameId, player: newPlayer } });
      console.log('成功添加玩家:', newPlayer.name, '到遊戲:', gameId);
    } catch (error) {
      console.error('添加玩家失敗:', error);
      throw error; // 重新拋出錯誤，讓調用者處理
    }
  }, [user?.uid]);

  const updatePlayer = useCallback(async (gameId: string, player: Player) => {
    try {
      const { error } = await supabase
        .from('players')
        .update({
          name: player.name,
          buy_in: player.buyIn,
          buy_ins: player.buyIns,
          profit: player.profit,
          status: player.status,
          buy_in_time: player.buyInTime,
          cash_out_time: player.cashOutTime,
          cash_out_amount: player.cashOutAmount,
          entry_fee_deducted: player.entryFeeDeducted,
          custom_entry_fee: player.customEntryFee,
        })
        .eq('id', player.id);

      if (error) throw error;

      dispatch({ type: 'UPDATE_PLAYER', payload: { gameId, player } });
    } catch (error) {
      console.error('更新玩家失敗:', error);
    }
  }, []);

  const deletePlayer = useCallback(async (gameId: string, playerId: string) => {
    try {
      console.log('🗑️ 開始刪除玩家:', playerId, '從遊戲:', gameId);
      
      // 先更新本地狀態，確保 UI 立即反映變化
      dispatch({ type: 'DELETE_PLAYER', payload: { gameId, playerId } });
      
      // 然後從數據庫刪除
      const { error, count } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId)
        .eq('game_id', gameId);

      if (error) {
        console.error('❌ 數據庫刪除玩家失敗:', error);
        // 如果數據庫刪除失敗，重新載入遊戲以恢復正確狀態
        const game = await fetchGameWithRelations(gameId);
        if (game) {
          dispatch({ type: 'UPDATE_GAME', payload: game });
          dispatch({ type: 'SET_CURRENT_GAME', payload: game });
        }
        throw error;
      }
      
      console.log('✅ 玩家刪除成功:', playerId, '刪除數量:', count);
    } catch (error) {
      console.error('刪除玩家失敗:', error);
    }
  }, []);

  // ============================================
  // Buy-In 操作（更新玩家的 buyIns 數組）
  // ============================================
  const addBuyInEntry = useCallback(async (gameId: string, playerId: string, amount: number, timestamp?: Date): Promise<void> => {
    // 使用最新的 state 而不是 stateRef，確保獲取最新數據
    const game = state.games.find(g => g.id === gameId) || state.currentGame;
    const player = game?.players.find(p => p.id === playerId);
    
    if (!player) {
      console.error('找不到玩家:', playerId, '在遊戲:', gameId);
      throw new Error('找不到指定的玩家');
    }

    const entry: BuyInEntry = { id: crypto.randomUUID(), amount, timestamp: timestamp || new Date() };
    const newBuyIns = [...(player.buyIns || []), entry];
    const newBuyIn = newBuyIns.reduce((s, e) => s + e.amount, 0);

    try {
      const { error } = await supabase
        .from('players')
        .update({
          buy_ins: newBuyIns,
          buy_in: newBuyIn,
          buy_in_time: player.buyInTime || entry.timestamp,
        })
        .eq('id', playerId);

      if (error) {
        console.error('添加買入數據庫錯誤:', error);
        throw error;
      }

      dispatch({ type: 'ADD_BUYIN', payload: { gameId, playerId, entry } });
      console.log('成功添加買入:', amount, '給玩家:', player.name, '在遊戲:', gameId);
    } catch (error) {
      console.error('添加買入失敗:', error);
      throw error; // 重新拋出錯誤，讓調用者處理
    }
  }, [state.games, state.currentGame]);

  const updateBuyInEntry = useCallback(async (gameId: string, playerId: string, entry: BuyInEntry) => {
    const game = stateRef.current.games.find(g => g.id === gameId);
    const player = game?.players.find(p => p.id === playerId);
    if (!player) return;

    const newBuyIns = (player.buyIns || []).map(e => e.id === entry.id ? entry : e);
    const newBuyIn = newBuyIns.reduce((s, e) => s + e.amount, 0);

    try {
      const { error } = await supabase
        .from('players')
        .update({
          buy_ins: newBuyIns,
          buy_in: newBuyIn,
        })
        .eq('id', playerId);

      if (error) throw error;

      dispatch({ type: 'UPDATE_BUYIN', payload: { gameId, playerId, entry } });
    } catch (error) {
      console.error('更新買入失敗:', error);
    }
  }, []);

  const deleteBuyInEntry = useCallback(async (gameId: string, playerId: string, entryId: string) => {
    const game = stateRef.current.games.find(g => g.id === gameId);
    const player = game?.players.find(p => p.id === playerId);
    if (!player) return;

    const newBuyIns = (player.buyIns || []).filter(e => e.id !== entryId);
    
    // 如果刪除後沒有任何買入記錄，刪除整個玩家
    if (newBuyIns.length === 0) {
      await deletePlayer(gameId, playerId);
      return;
    }

    const newBuyIn = newBuyIns.reduce((s, e) => s + e.amount, 0);

    try {
      const { error } = await supabase
        .from('players')
        .update({
          buy_ins: newBuyIns,
          buy_in: newBuyIn,
        })
        .eq('id', playerId);

      if (error) throw error;

      dispatch({ type: 'DELETE_BUYIN', payload: { gameId, playerId, entryId } });
    } catch (error) {
      console.error('刪除買入失敗:', error);
    }
  }, [deletePlayer]);

  // ============================================
  // 發牌員操作
  // ============================================
  const addDealer = useCallback(async (gameId: string, dealerData: Omit<Dealer, 'id' | 'totalTips' | 'estimatedSalary'>) => {
    try {
      const { data, error } = await supabase
        .from('dealers')
        .insert({
          game_id: gameId,
          name: dealerData.name,
          tip_share: dealerData.tipShare || 50,
          hourly_rate: dealerData.hourlyRate || 0,
          work_hours: dealerData.workHours || 0,
          start_time: dealerData.startTime,
          status: dealerData.status || 'working',
          host: dealerData.host,
        })
        .select()
        .single();

      if (error) throw error;

      const newDealer: Dealer = {
        ...dealerData,
        id: data.id,
        totalTips: 0,
        estimatedSalary: 0,
      };

      dispatch({ type: 'ADD_DEALER', payload: { gameId, dealer: newDealer } });
    } catch (error) {
      console.error('添加發牌員失敗:', error);
    }
  }, []);

  const updateDealer = useCallback(async (gameId: string, dealer: Dealer) => {
    try {
      const { error } = await supabase
        .from('dealers')
        .update({
          name: dealer.name,
          tip_share: dealer.tipShare,
          hourly_rate: dealer.hourlyRate,
          work_hours: dealer.workHours,
          start_time: dealer.startTime,
          end_time: dealer.endTime,
          status: dealer.status,
          total_tips: dealer.totalTips,
          estimated_salary: dealer.estimatedSalary,
          host: dealer.host,
        })
        .eq('id', dealer.id);

      if (error) throw error;

      dispatch({ type: 'UPDATE_DEALER', payload: { gameId, dealer } });
    } catch (error) {
      console.error('更新發牌員失敗:', error);
    }
  }, []);

  const deleteDealer = useCallback(async (gameId: string, dealerId: string) => {
    try {
      const { error } = await supabase
        .from('dealers')
        .delete()
        .eq('id', dealerId);

      if (error) throw error;

      dispatch({ type: 'DELETE_DEALER', payload: { gameId, dealerId } });
    } catch (error) {
      console.error('刪除發牌員失敗:', error);
    }
  }, []);

  // ============================================
  // 支出操作
  // ============================================
  const addExpense = useCallback(async (gameId: string, expenseData: Omit<Expense, 'id' | 'timestamp'>) => {
    try {
      const now = new Date();
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          game_id: gameId,
          category: expenseData.category,
          description: expenseData.description,
          amount: expenseData.amount,
          host: expenseData.host,
          timestamp: now,
        })
        .select()
        .single();

      if (error) {
        console.error('添加支出失敗:', error);
        throw new Error(error.message || '添加支出失敗');
      }

      const newExpense: Expense = {
        ...expenseData,
        id: data.id,
        timestamp: now,
      };

      dispatch({ type: 'ADD_EXPENSE', payload: { gameId, expense: newExpense } });
    } catch (error: any) {
      console.error('添加支出失敗:', error);
      // 重新拋出錯誤，讓調用者處理（例如顯示 Alert）
      throw error;
    }
  }, []);

  const updateExpense = useCallback(async (gameId: string, expense: Expense) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .update({
          category: expense.category,
          description: expense.description,
          amount: expense.amount,
          host: expense.host,
        })
        .eq('id', expense.id);

      if (error) throw error;

      dispatch({ type: 'UPDATE_EXPENSE', payload: { gameId, expense } });
    } catch (error) {
      console.error('更新支出失敗:', error);
    }
  }, []);

  const deleteExpense = useCallback(async (gameId: string, expenseId: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;

      dispatch({ type: 'DELETE_EXPENSE', payload: { gameId, expenseId } });
    } catch (error) {
      console.error('刪除支出失敗:', error);
    }
  }, []);

  // ============================================
  // 抽水操作
  // ============================================
  const addRake = useCallback(async (gameId: string, rakeData: Omit<Rake, 'id' | 'timestamp'>) => {
    try {
      const now = new Date();
      const { data, error } = await supabase
        .from('rakes')
        .insert({
          game_id: gameId,
          amount: rakeData.amount,
          note: rakeData.note,
          timestamp: now,
        })
        .select()
        .single();

      if (error) throw error;

      const newRake: Rake = {
        ...rakeData,
        id: data.id,
        timestamp: now,
      };

      dispatch({ type: 'ADD_RAKE', payload: { gameId, rake: newRake } });
    } catch (error) {
      console.error('添加抽水失敗:', error);
    }
  }, []);

  const updateRake = useCallback(async (gameId: string, rake: Rake) => {
    try {
      const { error } = await supabase
        .from('rakes')
        .update({
          amount: rake.amount,
          note: rake.note,
        })
        .eq('id', rake.id);

      if (error) throw error;

      dispatch({ type: 'UPDATE_RAKE', payload: { gameId, rake } });
    } catch (error) {
      console.error('更新抽水失敗:', error);
    }
  }, []);

  const deleteRake = useCallback(async (gameId: string, rakeId: string) => {
    try {
      const { error } = await supabase
        .from('rakes')
        .delete()
        .eq('id', rakeId);

      if (error) throw error;

      dispatch({ type: 'DELETE_RAKE', payload: { gameId, rakeId } });
    } catch (error) {
      console.error('刪除抽水失敗:', error);
    }
  }, []);

  // ============================================
  // 保險操作
  // ============================================
  const addInsurance = useCallback(async (gameId: string, insuranceData: Omit<Insurance, 'id' | 'timestamp'>) => {
    try {
      const now = new Date();
      const { data, error } = await supabase
        .from('insurances')
        .insert({
          game_id: gameId,
          amount: insuranceData.amount,
          partners: insuranceData.partners || [],
          timestamp: now,
        })
        .select()
        .single();

      if (error) throw error;

      const newInsurance: Insurance = {
        ...insuranceData,
        id: data.id,
        timestamp: now,
      };

      dispatch({ type: 'ADD_INSURANCE', payload: { gameId, insurance: newInsurance } });
    } catch (error) {
      console.error('添加保險失敗:', error);
    }
  }, []);

  const updateInsurance = useCallback(async (gameId: string, insurance: Insurance) => {
    try {
      const { error } = await supabase
        .from('insurances')
        .update({
          amount: insurance.amount,
          partners: insurance.partners,
        })
        .eq('id', insurance.id);

      if (error) throw error;

      dispatch({ type: 'UPDATE_INSURANCE', payload: { gameId, insurance } });
    } catch (error) {
      console.error('更新保險失敗:', error);
    }
  }, []);

  const deleteInsurance = useCallback(async (gameId: string, insuranceId: string) => {
    try {
      const { error } = await supabase
        .from('insurances')
        .delete()
        .eq('id', insuranceId);

      if (error) throw error;

      dispatch({ type: 'DELETE_INSURANCE', payload: { gameId, insuranceId } });
    } catch (error) {
      console.error('刪除保險失敗:', error);
    }
  }, []);

  // ============================================
  // 其他操作
  // ============================================
  const setDefaultInsurancePartners = useCallback(async (gameId: string, partners: InsurancePartner[]) => {
    const game = stateRef.current.games.find(g => g.id === gameId);
    if (!game) return;

    try {
      const { error } = await supabase
        .from('games')
        .update({ default_insurance_partners: partners })
        .eq('id', gameId);

      if (error) throw error;

      const updated: Game = { ...game, defaultInsurancePartners: partners };
      dispatch({ type: 'UPDATE_GAME', payload: updated });
    } catch (error) {
      console.error('更新默認保險夥伴失敗:', error);
    }
  }, []);

  const setGameSummaryModalVisible = useCallback((visible: boolean) => {
    dispatch({ type: 'SET_GAME_SUMMARY_MODAL_VISIBLE', payload: visible });
  }, []);

  const deleteGame = useCallback(async (gameId: string) => {
    // 先檢查本地狀態中是否存在這個遊戲，避免重複刪除
    const gameExists = stateRef.current.games.some(g => g.id === gameId);
    
    // 如果本地狀態中不存在，直接更新狀態並返回（可能已經被刪除或不存在）
    if (!gameExists) {
      // 仍然更新 currentGame 狀態，以防它是當前選中的遊戲
      const newCurrent =
        stateRef.current.currentGame && stateRef.current.currentGame.id === gameId
          ? null
          : stateRef.current.currentGame;
      
      if (stateRef.current.currentGame?.id === gameId) {
        dispatch({ type: 'SET_CURRENT_GAME', payload: null });
      }
      // 靜默返回，不顯示警告（這是正常情況）
      return;
    }

    try {
      // Supabase 會自動刪除關聯的子表數據（CASCADE）
      const { error, data } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId)
        .select(); // 返回刪除的數據，確認刪除成功

      if (error) {
        // 檢查是否是因為記錄不存在而導致的錯誤
        if (error.code === 'PGRST116' || error.message?.includes('not found')) {
          // 記錄不存在是正常情況，靜默處理
          const updatedGames = stateRef.current.games.filter((g) => g.id !== gameId);
          const newCurrent =
            stateRef.current.currentGame && stateRef.current.currentGame.id === gameId
              ? null
              : stateRef.current.currentGame;
          
          dispatch({ type: 'SET_GAMES', payload: updatedGames });
          dispatch({ type: 'SET_CURRENT_GAME', payload: newCurrent });
          return;
        }
        
        console.error('刪除遊戲失敗:', error);
        dispatch({ type: 'SET_ERROR', payload: `刪除遊戲失敗: ${error.message}` });
        return; // 刪除失敗，不更新狀態
      }

      // 確認刪除成功後才更新本地狀態
      if (data && data.length > 0) {
        // 刪除成功，更新本地狀態
        const updatedGames = stateRef.current.games.filter((g) => g.id !== gameId);
        const newCurrent =
          stateRef.current.currentGame && stateRef.current.currentGame.id === gameId
            ? null
            : stateRef.current.currentGame;

        dispatch({ type: 'SET_GAMES', payload: updatedGames });
        dispatch({ type: 'SET_CURRENT_GAME', payload: newCurrent });
        dispatch({ type: 'SET_ERROR', payload: null }); // 清除錯誤
        
        // 不立即重新載入，因為我們已經手動更新了本地狀態
        // 只有在真正需要同步時才重新載入（例如用戶手動刷新）
        // 這樣可以避免競態條件和閃爍問題
      } else {
        // 沒有刪除任何記錄（可能已經不存在或已被刪除）
        // 這是正常情況，靜默處理，不顯示警告
        const updatedGames = stateRef.current.games.filter((g) => g.id !== gameId);
        const newCurrent =
          stateRef.current.currentGame && stateRef.current.currentGame.id === gameId
            ? null
            : stateRef.current.currentGame;
        
        dispatch({ type: 'SET_GAMES', payload: updatedGames });
        dispatch({ type: 'SET_CURRENT_GAME', payload: newCurrent });
        // 不重新載入，因為我們已經手動更新了本地狀態
      }
    } catch (error: any) {
      // 檢查是否是因為記錄不存在而導致的錯誤
      if (error?.code === 'PGRST116' || error?.message?.includes('not found')) {
        // 記錄不存在是正常情況，靜默處理
        const updatedGames = stateRef.current.games.filter((g) => g.id !== gameId);
        const newCurrent =
          stateRef.current.currentGame && stateRef.current.currentGame.id === gameId
            ? null
            : stateRef.current.currentGame;
        
        dispatch({ type: 'SET_GAMES', payload: updatedGames });
        dispatch({ type: 'SET_CURRENT_GAME', payload: newCurrent });
        return;
      }
      
      console.error('刪除遊戲失敗:', error);
      dispatch({ type: 'SET_ERROR', payload: `刪除遊戲失敗: ${error?.message || '未知錯誤'}` });
    }
  }, []);

  const clearAllGames = useCallback(async () => {
    if (!user?.uid) return;

    try {
      // 刪除用戶的所有遊戲（CASCADE 會自動刪除關聯數據）
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('user_id', user.uid);

      if (error) throw error;

      dispatch({ type: 'SET_GAMES', payload: [] });
      dispatch({ type: 'SET_CURRENT_GAME', payload: null });
    } catch (error) {
      console.error('清除所有遊戲失敗:', error);
    }
  }, [user?.uid]);

  const reorderGames = useCallback((orderedIds: string[]) => {
    if (!orderedIds.length) return;
    const idSet = new Set(orderedIds);
    const reordered: Game[] = [
      ...orderedIds
        .map((id) => stateRef.current.games.find((g) => g.id === id))
        .filter((g): g is Game => !!g),
      ...stateRef.current.games.filter((g) => !idSet.has(g.id)),
    ];

    dispatch({ type: 'SET_GAMES', payload: reordered });
    // 注意：遊戲順序不保存到 Supabase，只在本地維護
  }, []);

  const endGame = useCallback(async (gameId: string, endData: { endTime: Date; actualCollection: number; finalNotes?: string }) => {
    const game = stateRef.current.games.find(g => g.id === gameId);
    if (!game) return;

    try {
      const { error } = await supabase
        .from('games')
        .update({
          end_time: endData.endTime,
          actual_collection: endData.actualCollection,
          final_notes: endData.finalNotes,
          status: 'completed',
        })
        .eq('id', gameId);

      if (error) throw error;

      const updatedGame: Game = {
        ...game,
        endTime: endData.endTime,
        actualCollection: endData.actualCollection,
        finalNotes: endData.finalNotes,
        status: 'completed',
      };

      dispatch({ type: 'UPDATE_GAME', payload: updatedGame });
      dispatch({ type: 'SET_CURRENT_GAME', payload: null });
    } catch (error) {
      console.error('結束遊戲失敗:', error);
    }
  }, []);

  // ============================================
  // Effects
  // ============================================
  useEffect(() => {
    if (user?.uid) {
      loadGames();
    } else {
      dispatch({ type: 'SET_GAMES', payload: [] });
      dispatch({ type: 'SET_CURRENT_GAME', payload: null });
    }
  }, [user?.uid, loadGames]);

  // 監聽頁面可見性變化（處理手機從後台返回的情況）
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    let isRefreshing = false;
    let lastRefreshTime = 0;
    const REFRESH_COOLDOWN = 5000; // 5 秒冷卻時間，避免頻繁刷新

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && user?.uid && !isRefreshing) {
        const now = Date.now();
        if (now - lastRefreshTime < REFRESH_COOLDOWN) {
          console.log('頁面可見性：冷卻中，跳過刷新');
          return;
        }

        console.log('頁面重新變為可見，重新載入遊戲數據...');
        isRefreshing = true;
        lastRefreshTime = now;

        try {
          await loadGames();
          console.log('遊戲數據已重新載入');
        } catch (error) {
          console.error('重新載入遊戲數據失敗:', error);
        } finally {
          isRefreshing = false;
        }
      }
    };

    // 監聽頁面可見性變化
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // 監聽頁面焦點
    window.addEventListener('focus', handleVisibilityChange);

    // 監聽 pageshow 事件（用於處理 bfcache 返回的情況）
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        console.log('遊戲頁面從 bfcache 恢復');
        handleVisibilityChange();
      }
    };
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [user?.uid, loadGames]);

  // ============================================
  // Supabase Realtime 訂閱（協作同步）
  // ============================================
  
  // 重新載入單個遊戲（更高效）
  const reloadCurrentGame = useCallback(async (gameId: string) => {
    console.log('🔄 即時同步：重新載入遊戲', gameId);
    try {
      const game = await fetchGameWithRelations(gameId);
      if (game) {
        dispatch({ type: 'UPDATE_GAME', payload: game });
        if (state.currentGame?.id === gameId) {
          dispatch({ type: 'SET_CURRENT_GAME', payload: game });
        }
      }
    } catch (error) {
      console.error('重新載入遊戲失敗:', error);
    }
  }, [state.currentGame?.id]);
  
  useEffect(() => {
    if (!user?.uid || !state.currentGame?.id) return;

    const gameId = state.currentGame.id;
    console.log('🔔 設置 Realtime 訂閱，遊戲ID:', gameId);

    // 使用防抖避免頻繁更新
    let debounceTimer: NodeJS.Timeout | null = null;
    const debouncedReload = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        reloadCurrentGame(gameId);
      }, 300); // 300ms 防抖
    };

    // 訂閱 games 表變更
    const gamesChannel = supabase
      .channel(`game-realtime-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          console.log('📝 遊戲更新:', payload.eventType);
          debouncedReload();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          console.log('👤 玩家變更:', payload.eventType, payload.old, payload.new);
          // DELETE 事件不需要重新載入，因為本地已經處理了
          if (payload.eventType === 'DELETE') {
            console.log('👤 玩家刪除事件，跳過重新載入');
            return;
          }
          debouncedReload();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dealers',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          console.log('🎴 發牌員變更:', payload.eventType);
          debouncedReload();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          console.log('💰 支出變更:', payload.eventType);
          debouncedReload();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rakes',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          console.log('🎰 抽水變更:', payload.eventType);
          debouncedReload();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'insurances',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          console.log('🛡️ 保險變更:', payload.eventType);
          debouncedReload();
        }
      )
      .subscribe((status) => {
        console.log('🔔 Realtime 訂閱狀態:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime 訂閱成功！協作同步已啟用');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Realtime 訂閱失敗，請確認 Supabase Realtime 已啟用');
        }
      });

    return () => {
      console.log('🔕 取消 Realtime 訂閱');
      if (debounceTimer) clearTimeout(debounceTimer);
      supabase.removeChannel(gamesChannel);
    };
  }, [user?.uid, state.currentGame?.id, reloadCurrentGame]);

  const contextValue: GameContextType = useMemo(() => ({
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
    clearAllGames,
  }), [
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
    clearAllGames,
  ]);

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

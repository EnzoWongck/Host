export interface Player {
  id: string;
  name: string;
  buyIn: number;
  buyIns?: BuyInEntry[]; // 細項買入紀錄
  profit: number;
  status: 'active' | 'cashed_out';
  createdAt: Date;
  updatedAt: Date;
  buyInTime?: Date; // 買入時間（用於計算入場費）
  cashOutTime?: Date; // 兌現時間（用於計算入場費）
  cashOutAmount?: number;
  entryFeeDeducted?: boolean;
  customEntryFee?: number; // 自訂入場費（優先於計算值）
}

export interface BuyInEntry {
  id: string;
  amount: number;
  timestamp: Date;
}

export interface Dealer {
  id: string;
  name: string;
  tipShare: 50 | 100;
  hourlyRate: number;
  workHours: number;
  startTime?: Date;
  endTime?: Date;
  status: 'working' | 'off_duty';
  totalTips: number;
  estimatedSalary: number;
  host?: string; // 負責此發牌員薪金的 Host 名稱
}

export interface Expense {
  id: string;
  category: 'takeout' | 'miscellaneous' | 'taxi' | 'venue' | 'other';
  description?: string;
  amount: number;
  host?: string; // 支付的 Host 名稱
  timestamp: Date;
}

export interface Rake {
  id: string;
  amount: number;
  timestamp: Date;
  note?: string;
}

export interface Insurance {
  id: string;
  amount: number; // 可為正負數
  timestamp: Date;
  partners: InsurancePartner[];
}

export interface InsurancePartner {
  id: string;
  name: string;
  percentage: number;
}

export interface Host {
  name: string;
  cost: number; // 原本的支出（從 expenses 拆分出來）
  dealerSalary: number; // 發牌員薪金
  totalCashOut: number; // 該 Host 收到的總兌現金額
  shareRatio: number; // 分成比例（0-1）
  transferAmount: number; // 轉帳金額（計算得出）
}

export interface Game {
  id: string;
  name: string;
  hosts: (Host | string)[]; // 支持 Host[] 或 string[]（向後兼容）
  smallBlind: number;
  bigBlind: number;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'completed';
  actualCollection?: number;
  finalNotes?: string;
  gameMode?: 'rake' | 'noRake'; // 遊戲模式：抽水或不抽水
  entryFeeMode?: 'fixed' | 'custom' | 'hourly'; // 入場費模式：統一或自訂/按時長（hourly 為舊資料）
  fixedEntryFee?: number; // 統一入場費金額
  hourlyRate?: number; // 每小時收費金額
  players: Player[];
  dealers: Dealer[];
  expenses: Expense[];
  rakes: Rake[];
  insurances: Insurance[];
  defaultInsurancePartners?: InsurancePartner[];
  totalBuyIn: number;
  totalCashOut: number;
  totalRake: number;
  totalTips: number;
  totalExpenses: number;
  dealerSalaries: number;
  netProfit: number;
}

export interface GameSummary {
  game: Game;
  playerCount: number;
  duration: number;
  isBalanced: boolean;
  actualCash: number;
  cashDifference: number;
}

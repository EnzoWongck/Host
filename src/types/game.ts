export interface Player {
  id: string;
  name: string;
  buyIn: number;
  buyIns?: BuyInEntry[]; // 細項買入紀錄
  profit: number;
  status: 'active' | 'cashed_out';
  createdAt: Date;
  updatedAt: Date;
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

export interface Game {
  id: string;
  name: string;
  hosts: string[];
  smallBlind: number;
  bigBlind: number;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'completed';
  actualCollection?: number;
  finalNotes?: string;
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

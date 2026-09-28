export type UserRole = 'user' | 'admin';

export interface UserEntity {
  id: string;
  username?: string;
  password?: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  ward: string;
  upiId: string;
  pointsBalance: number;
  totalKgDisposed: number;
  avatarId: string;
  createdAt: number;
}

export type DisposalStatus = 'Verified' | 'Flagged' | 'Pending';

export interface DisposalLogEntity {
  id: string;
  userId: string;
  userName: string;
  category: 'Biodegradable' | 'Non-Biodegradable' | string;
  subCategory: string;
  weightKg: number;
  pointsAwarded: number;
  binLocation: string;
  status: DisposalStatus;
  imageProofUri: string;
  timestamp: number;
}

export type TransactionType = 'REWARD_CREDIT' | 'CASH_WITHDRAWAL_UPI' | 'CASH_WITHDRAWAL_BANK';
export type TransactionStatus = 'Verified' | 'Pending' | 'Transferred' | 'Rejected';

export interface WalletTransactionEntity {
  id: string;
  userId: string;
  userName: string;
  type: TransactionType;
  pointsDelta: number;
  cashAmountInr: number;
  status: TransactionStatus;
  payoutDestination: string;
  referenceNumber: string;
  timestamp: number;
}

export interface BinStation {
  id: string;
  name: string;
  address: string;
  ward: string;
  capacityPercent: number;
}

export interface WasteScanResult {
  itemName: string;
  itemType?: string;
  materialType: string;
  category: 'Biodegradable' | 'Non-Biodegradable';
  isBiodegradable: boolean;
  decompositionTime: string;
  biodegradableExplanation: string;
  howItCanBeRecycled: string;
  spokenSummary?: string;
  binColorName: string;
  binColorHex: string;
  estimatedWeightKg: number;
  estimatedPoints: number;
  co2SavedKg: number;
  confidenceScore: number;
  reasoning: string;
  disposalInstructions: string;
  preparationTip: string;
  disposalSteps?: string[];
  disposalDos?: string[];
  disposalDonts?: string[];
  recyclabilityPercentage?: number;
  googleGroundingSearchQuery?: string;
  searchSources?: Array<{ title: string; uri: string }>;
}

export type ScreenRoute = 'home' | 'scanner' | 'disposal' | 'wallet' | 'leaderboard' | 'about' | 'admin' | 'profile' | 'auth' | 'forbidden';

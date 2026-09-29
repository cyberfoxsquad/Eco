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
  purityScore?: number;
  googleGroundingSearchQuery?: string;
  searchSources?: Array<{ title: string; uri: string }>;
}

export interface ChatScoreBreakdown {
  recyclabilityScore: number;
  ecoPointsScore: number;
  cashEquivalentInr: number;
  purityScore: number;
  carbonReductionKg: number;
  confidenceScore: number;
}

export type GeminiModelType = 'gemini-2.5-flash' | 'gemini-2.5-flash-lite' | 'gemini-2.5-pro';

export type ChatbotRole =
  | 'civic_waste_expert'
  | 'zero_waste_coach'
  | 'compost_specialist'
  | 'circularity_auditor';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: number;
  modelUsed?: string;
  roleUsed?: ChatbotRole;
  imageUri?: string;
  scanResult?: WasteScanResult;
  suggestedPrompts?: string[];
  isScanning?: boolean;
}

export type ScreenRoute = 'home' | 'scanner' | 'assistant' | 'disposal' | 'wallet' | 'leaderboard' | 'about' | 'admin' | 'profile' | 'auth' | 'forbidden';

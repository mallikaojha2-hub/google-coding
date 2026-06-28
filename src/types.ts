export type TicketStatus = 'submitted' | 'under_review' | 'ongoing' | 'fixed' | 'closed' | 'rejected';

export type TicketCategory = 'Potholes' | 'Water Leakage' | 'Damaged Streetlights' | 'Waste Management';

export interface TransparencyStep {
  step: string;
  timestamp: string;
  holderDesk: string;
  active: boolean;
}

export interface ForumReply {
  id: string;
  author: string;
  isAuthority: boolean;
  text: string;
  timestamp: string;
}

export interface Ticket {
  id: string;
  pincode: string;
  title: string;
  description: string;
  category: TicketCategory;
  targetDepartment: string;
  citizenName: string;
  isAnonymous: boolean;
  citizenId: string;
  lat: number;
  lng: number;
  locationName: string;
  isUnverifiedLocation: boolean;
  mediaUrl: string;
  mediaType: 'photo' | 'video';
  status: TicketStatus;
  upvotes: number;
  upvotedUserIds: string[];
  createdAt: string;
  fixedAt?: string;
  reopenFlags: number;
  reopenedUserIds: string[];
  
  // AI Evaluation Outputs
  aiEvaluated: boolean;
  verifiedCategory: string;
  urgencyScore: number;
  aiReasoning: string;

  // Admin Override
  adminOverridden?: boolean;
  rejectionRationale?: string;
  adminNotes?: string;

  // Drawer State Extensions
  transparencyLog: TransparencyStep[];
  milestoneProgress: number; // 0, 1, or 2
  fieldPhotoUrl?: string;
  forumReplies: ForumReply[];
}

export interface UserProfile {
  id: string;
  name: string;
  pincode: string;
  cumulativeXP: number;
  verifiedVotesReceived: number;
  negativePenalties: number;
  totalScore: number;
  rewardsClaimed: string[];
  nextMilestone: number;
  isRewardAvailable: boolean;
  pendingVoucher?: string;
  role: 'citizen' | 'admin';
}

export interface ReceiptLog {
  id: string;
  vendor: string;
  amount: number;
  date: string;
  receiptUrl: string;
  description: string;
}

export interface CrowdfundWallet {
  pincode: string;
  projectName: string;
  targetGoal: number;
  amountRaised: number;
  receiptLogs: ReceiptLog[];
}

export interface ExecutionPhoto {
  id: string;
  userId: string;
  authorName: string;
  photoUrl: string;
  timestamp: string;
  coords: { lat: number; lng: number };
}

export interface SocialDrive {
  id: string;
  pincode: string;
  title: string;
  description: string;
  date: string;
  locationName: string;
  geofenceCenter: { lat: number; lng: number };
  geofenceRadiusMeters: number;
  rsvps: { userId: string; status: 'attending' | 'cannot_attend' }[];
  executionPhotos: ExecutionPhoto[];
}

export interface AppState {
  currentUser: UserProfile;
  activePincode: string;
  tickets: Ticket[];
  crowdfundWallet: CrowdfundWallet;
  socialDrives: SocialDrive[];
  leaderboard: { userId: string; maskedName: string; score: number; rank: number; badge: string }[];
}

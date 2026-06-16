export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  role: UserRole;
  email?: string;
  passwordHash?: string;
  fullName: string;
  studentCode?: string;      // Unique code for students to login
  isFirstLogin?: boolean;     // For teachers to force change password
  registeredDeviceId?: string | null; // Locked device fingerprint
  activeAvatarPath: string;
  activeFramePath: string | null;
  activeEffectPath: string | null;
  activeBadgePath?: string | null;   // Selected Title/Badge
  adminClass?: string;        // Administrative class, e.g. "Lớp 5A"
}

export interface Room {
  id: string;
  roomName: string;
  description: string;
  teacherId: string | null;
  inviteCode: string;
  adminClass?: string;       // Explicit administrative class link Or Grade if general
  roomType?: 'specific' | 'general'; // specific to adminClass, or general to a Grade level
  grade?: string; // e.g. "Khối 3", "Khối 4", "Khối 5"
}

export interface RoomParticipant {
  id: string;
  roomId: string;
  studentId: string;
  currentXp: number;
  currentLevel: number;
  goldBalance: number;
  luckySpins: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option
}

export interface Quest {
  id: string;
  roomId: string;
  title: string;
  description: string;
  questType: 'quiz' | 'file';
  quizData?: QuizQuestion[]; // JSON structure for automated grading
  rewardXp: number;
  rewardGold: number;
  penaltyXp: number;
  deadline: string; // ISO String
}

export interface QuestSubmission {
  id: string;
  questId: string;
  studentId: string;
  submissionValue?: string; // Answers or comments/file text
  status: 'pending' | 'submitted' | 'passed' | 'failed';
  isVoucherUsed?: boolean;
  submittedAt?: string;
  gradedAt?: string;
}

export interface CosmeticCatalogItem {
  id: string;
  name: string;
  type: 'avatar' | 'frame' | 'effect' | 'badge';
  filePath: string; // internal identifier or visual style definition (e.g., 'frame_wood', 'effect_neon_glow' or complex SVG/DataURL)
  isDefault?: boolean;
  minLevel?: number; // Level threshold
  isUploaded?: boolean; // customized uploaded item
}

export interface InventoryItem {
  id: string;
  studentId: string;
  roomId: string; // general room or specific room
  cosmeticId: string;
  status: 'unused' | 'used';
  unlockedAt: string;
}

export interface ShopItem {
  id: string;
  roomId: string;
  itemName: string;
  description: string;
  coinPrice: number;
  stock: number; // -1 for infinite
  imageUrl?: string; // user provided option
}

export interface PendingPurchase {
  id: string;
  studentId: string;
  studentName: string;
  roomId: string;
  roomName: string;
  shopItemId: string;
  itemName: string;
  coinPrice: number;
  status: 'pending' | 'approved' | 'rejected';
  purchasedAt: string;
}

export interface SystemThemeSchedule {
  id: string;
  themeId: string;       // 'light' | 'dark' | 'tet' | 'mid_autumn' | 'christmas' | 'halloween'
  name: string;          // Name of the schedule/holiday
  type: 'always' | 'scheduled' | 'time_of_day'; // Manual/Always, Date range, or Time of day
  startDate?: string;    // YYYY-MM-DD
  endDate?: string;      // YYYY-MM-DD
  startHour?: number;    // 0-23
  endHour?: number;      // 0-23
  isTemporary: boolean;  // Has expiration/duration limit, or is permanent
  isActive: boolean;
}

export interface SystemThemeSettings {
  activeThemeId: string;
  schedules: SystemThemeSchedule[];
}


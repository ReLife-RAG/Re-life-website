export type GameCategory = 'substance' | 'social' | 'behavioral' | 'pornography' | 'screen' | 'mindfulness';

// ── Game ──────────────────────────────────────────────────────────────────────
export interface Game {
  _id: string;
  name: string;
  title: string;
  description: string;
  category: GameCategory;
  icon: string;
  color: string;
  features: string[];
  activePlayers: number;
  rating: number;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Game Progress ─────────────────────────────────────────────────────────────
export interface GameProgress {
  _id: string;
  userId: string;
  gameId: string;
  gameType: 'sober' | 'forest' | 'habitica' | 'braver' | 'mindful' | 'journal';
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayed?: string;
  isFavorite: boolean;

  soberData?: {
    daysSober: number;
    pledgedToday: boolean;
    lastPledgeDate?: string;
    moneySaved: number;
    hoursSober: number;
    milestones: string[];
  };

  forestData?: {
    coins: number;
    treesPlanted: number;
    totalFocusTime: number;
    currentSessionStart?: string;
    currentSessionDuration?: number;
  };

  habiticaData?: {
    level: number;
    class: string;
    hp: number;
    maxHp: number;
    xp: number;
    xpToNext: number;
    mp: number;
    maxMp: number;
    tasksCompleted: number;
    questsCompleted: number;
    tasksDoneToday: string[];
    lastTaskReset?: string;
  };

  braverData?: {
    daysStrong: number;
    checkedInToday: boolean;
    lastCheckinDate?: string;
    challengesCompleted: number;
    challengesDoneToday: string[];
    lastChallengeReset?: string;
    badges: string[];
    currentMood?: string;
  };

  mindfulData?: {
    roundsCompleted: number;
    exercisesDoneToday: string[];
    totalSessions: number;
    lastBreathingDate?: string;
    currentStreak: number;
  };

  journalData?: {
    entriesCount: number;
    currentStreak: number;
    lastEntryDate?: string;
    promptsCompleted: string[];
    moodHistory: Array<{date: string, mood: number}>;
    insightsUnlocked: string[];
  };

  createdAt: string;
  updatedAt: string;
}

// ── Daily Check-In ────────────────────────────────────────────────────────────
export interface DailyCheckIn {
  _id: string;
  userId: string;
  date: string;
  mood: number;
  gamesPlayed: string[];
  pointsEarned: number;
  notes?: string;
  createdAt: string;
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
export interface LeaderboardEntry {
  _id: string;
  username: string;      // always anonymous e.g. User#4A2F
  totalPoints: number;
  currentStreak: number;
  rank: number;
}

// ── Recent Activity ───────────────────────────────────────────────────────────
export interface RecentActivity {
  game: Game;
  lastPlayed?: string;
  totalPoints: number;
  currentStreak: number;
}

// ── Component Props ───────────────────────────────────────────────────────────
export interface GameCardProps {
  game: Game;
  progress?: GameProgress;
  onPlay:      (game: Game) => void;
  onFavorite:  (gameId: string) => void;
  onShare:     (gameName: string) => void;
  onHide:      (gameId: string) => void;
  showToast:   (message: string, type?: 'success' | 'error' | 'info') => void;
}

export interface GameScreenProps {
  progress: GameProgress;
  onUpdateProgress: (updates: Partial<GameProgress>) => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}
import mongoose, { Schema, Document } from 'mongoose';

export type GameCategory = 'substance' | 'social' | 'behavioral' | 'pornography' | 'screen' | 'mindfulness';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface IGame extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface IGameProgress extends Document {
  userId: mongoose.Types.ObjectId;
  gameId: mongoose.Types.ObjectId;
  gameType: 'sober' | 'forest' | 'habitica' | 'braver';
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayed?: Date;
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
    currentSessionStart?: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface IDailyCheckIn extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  mood: number;
  gamesPlayed: string[];
  pointsEarned: number;
  notes?: string;
  createdAt: Date;
}

export interface ILeaderboard extends Document {
  userId: mongoose.Types.ObjectId;
  anonUsername: string;
  totalPoints: number;
  currentStreak: number;
  rank: number;
  lastUpdated: Date;
}

// ── Schemas ───────────────────────────────────────────────────────────────────

const GameSchema = new Schema<IGame>({
  name:         { type: String, required: true, unique: true },
  title:        { type: String, required: true },
  description:  { type: String, required: true },
  category:     { type: String, enum: ['substance','social','behavioral','pornography','screen','mindfulness'], required: true },
  icon:         { type: String, required: true },
  color:        { type: String, required: true },
  features:     [{ type: String }],
  activePlayers:{ type: Number, default: 0 },
  rating:       { type: Number, default: 0, min: 0, max: 5 },
  difficulty:   { type: String, enum: ['easy','medium','hard'], default: 'medium' },
  estimatedTime:{ type: String, default: '5-10 min' },
  isHidden:     { type: Boolean, default: false },
}, { timestamps: true });

const GameProgressSchema = new Schema<IGameProgress>({
  userId:        { type: Schema.Types.ObjectId, ref: 'users', required: true },
  gameId:        { type: Schema.Types.ObjectId, ref: 'games', required: true },
  gameType:      { type: String, enum: ['sober','forest','habitica','braver'], required: true },
  totalPoints:   { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastPlayed:    { type: Date },
  isFavorite:    { type: Boolean, default: false },
  soberData: {
    daysSober:      { type: Number, default: 0 },
    pledgedToday:   { type: Boolean, default: false },
    lastPledgeDate: { type: String, default: null },
    moneySaved:     { type: Number, default: 0 },
    hoursSober:     { type: Number, default: 0 },
    milestones:     [{ type: String }],
  },
  forestData: {
    coins:           { type: Number, default: 0 },
    treesPlanted:    { type: Number, default: 0 },
    totalFocusTime:  { type: Number, default: 0 },
    currentSessionStart:    { type: Date },
    currentSessionDuration: { type: Number },
  },
  habiticaData: {
    level:          { type: Number, default: 1 },
    class:          { type: String, default: 'Warrior' },
    hp:             { type: Number, default: 100 },
    maxHp:          { type: Number, default: 100 },
    xp:             { type: Number, default: 0 },
    xpToNext:       { type: Number, default: 500 },
    mp:             { type: Number, default: 60 },
    maxMp:          { type: Number, default: 100 },
    tasksCompleted: { type: Number, default: 0 },
    questsCompleted:{ type: Number, default: 0 },
    tasksDoneToday: [{ type: String }],
    lastTaskReset:  { type: String, default: null },
  },
  braverData: {
    daysStrong:          { type: Number, default: 0 },
    checkedInToday:      { type: Boolean, default: false },
    lastCheckinDate:     { type: String, default: null },
    challengesCompleted: { type: Number, default: 0 },
    challengesDoneToday: [{ type: String }],
    lastChallengeReset:  { type: String, default: null },
    badges:              [{ type: String }],
    currentMood:         { type: String },
  },
}, { timestamps: true });

const DailyCheckInSchema = new Schema<IDailyCheckIn>({
  userId:       { type: Schema.Types.ObjectId, ref: 'users', required: true },
  date:         { type: Date, required: true },
  mood:         { type: Number, min: 1, max: 5, required: true },
  gamesPlayed:  [{ type: Schema.Types.ObjectId, ref: 'games' }],
  pointsEarned: { type: Number, default: 0 },
  notes:        { type: String },
}, { timestamps: true });

const LeaderboardSchema = new Schema<ILeaderboard>({
  userId:        { type: Schema.Types.ObjectId, ref: 'users', required: true, unique: true },
  anonUsername:  { type: String, required: true },
  totalPoints:   { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  rank:          { type: Number },
  lastUpdated:   { type: Date, default: Date.now },
}, { timestamps: true });

// ── Indexes ───────────────────────────────────────────────────────────────────
GameProgressSchema.index({ userId: 1, gameId: 1 }, { unique: true });
GameProgressSchema.index({ userId: 1, gameType: 1 });
DailyCheckInSchema.index({ userId: 1, date: 1 }, { unique: true });
LeaderboardSchema.index({ totalPoints: -1 });

// ── Models ────────────────────────────────────────────────────────────────────
export const Game         = mongoose.model<IGame>('games', GameSchema);
export const GameProgress = mongoose.model<IGameProgress>('gameprogress', GameProgressSchema);
export const DailyCheckIn = mongoose.model<IDailyCheckIn>('dailycheckin', DailyCheckInSchema);
export const Leaderboard  = mongoose.model<ILeaderboard>('leaderboard', LeaderboardSchema);
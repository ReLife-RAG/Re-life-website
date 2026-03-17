import mongoose, { Schema, Document } from 'mongoose';

export interface IGameState extends Document {
  userId: string;

  // ── Sober 
  soberDays: number;
  lastPledgeDate: string | null;

  // ── Forest 
  forestCoins: number;

  // ── Habitica (RPG)
  rpgXP: number;
  rpgHP: number;
  rpgLevel: number;
  tasksDoneToday: string[];
  tasksResetDate: string | null;

  // ── Braver 
  braverDays: number;
  braverLastCheckin: string | null;
  challengesDoneToday: string[];
  challengesResetDate: string | null;

  // ── Points & RPG System
  totalPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  weeklyResetDate: string | null;
  monthlyResetDate: string | null;
  xp: number;      // for leveling
  level: number;   // for leveling

  // Optional fields used in Health Score
  totalFocusMinutes?: number;
  totalTasksCompleted?: number;

  createdAt: Date;
  updatedAt: Date;
}

const GameStateSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true },

    // Sober
    soberDays:      { type: Number, default: 0 },
    lastPledgeDate: { type: String, default: null },

    // Forest
    forestCoins: { type: Number, default: 0 },

    // Habitica
    rpgXP:          { type: Number, default: 0 },
    rpgHP:          { type: Number, default: 100 },
    rpgLevel:       { type: Number, default: 1 },
    tasksDoneToday: { type: [String], default: [] },
    tasksResetDate: { type: String, default: null },

    // Braver
    braverDays:          { type: Number, default: 0 },
    braverLastCheckin:   { type: String, default: null },
    challengesDoneToday: { type: [String], default: [] },
    challengesResetDate: { type: String, default: null },

    // Points
    totalPoints:      { type: Number, default: 0 },
    weeklyPoints:     { type: Number, default: 0 },   // added
    monthlyPoints:    { type: Number, default: 0 },   // added
    weeklyResetDate:  { type: String, default: null },// added
    monthlyResetDate: { type: String, default: null },// added
    xp:               { type: Number, default: 0 },   // added
    level:            { type: Number, default: 1 },   // added

    // Optional for Health Score
    totalFocusMinutes:   { type: Number, default: 0 },
    totalTasksCompleted: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IGameState>('GameState', GameStateSchema);
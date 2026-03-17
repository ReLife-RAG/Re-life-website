export type GameId = 'sober' | 'forest' | 'habitica' | 'braver';

export interface GameEntry {
  id: GameId;
  title: string;
  category: string;
  color: string;
  icon: string;
  tag: string;
  players: number;
  rating: number;
}

export interface SoberState {
  soberDays: number;
  pledgedToday: boolean;
  moneySaved: number;
  totalPoints: number;
}

export interface ForestState {
  forestCoins: number;
  treesGrown: number;
  coinsEarned?: number;
}

export interface RpgTask {
  id: string; label: string; xp: number; done: boolean;
}

export interface HabiticaState {
  rpgXP: number; rpgHP: number; rpgLevel: number; tasks: RpgTask[];
}

export interface Challenge {
  id: string; label: string; pts: number; done: boolean;
}

export interface BraverState {
  braverDays: number; checkedInToday: boolean; challenges: Challenge[];
}

export interface ActivityEntry {
  gameId: GameId; date: string; sessions: number; pointsEarned: number;
}

export interface LeaderboardEntry {
  rank: number; handle: string; points: number;
}
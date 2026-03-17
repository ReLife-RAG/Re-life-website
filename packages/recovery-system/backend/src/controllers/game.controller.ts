import { Request, Response } from 'express';
import GameState, { IGameState } from '../models/GameState';
import Activity from '../models/Activity';

// ── Helpers ──────────────────────────────────────────────────────

// Get today's date in YYYY-MM-DD format
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// Get existing game state or create new for a user
async function getOrCreate(userId: string): Promise<IGameState> {
  let gs = await GameState.findOne({ userId });
  if (!gs) {
    gs = await GameState.create({ userId });
  }
  return gs;
}

// Log daily activity for a game
async function logActivity(userId: string, gameId: string, points: number) {
  const d = today();
  const activity = await Activity.findOne({ userId, gameId, date: d });
  if (activity) {
    activity.sessions += 1;
    activity.pointsEarned += points;
    await activity.save();
  } else {
    await Activity.create({ userId, gameId, date: d, sessions: 1, pointsEarned: points });
  }
}

// ── Static Data ──────────────────────────────────────────────────

const GAMES_LIST = [
  { id: 'sober', title: 'I Am Sober', category: 'substance', color: 'green', icon: '🌿' },
  { id: 'forest', title: 'Forest - Stay Focused', category: 'social', color: 'blue', icon: '🌳' },
  { id: 'habitica', title: 'Habitica', category: 'behavioral', color: 'purple', icon: '⚔️' },
  { id: 'braver', title: 'Braver', category: 'pornography', color: 'amber', icon: '🛡️' },
];

const RPG_TASKS = [
  { id: 'meditation', label: 'Morning meditation (10 min)', xp: 15 },
  { id: 'no_social', label: 'No social media before noon', xp: 20 },
  { id: 'water', label: 'Drink 8 glasses of water', xp: 10 },
  { id: 'buddy', label: 'Call a support buddy', xp: 25 },
  { id: 'journal', label: 'Journal entry tonight', xp: 15 },
];

const CHALLENGES = [
  { id: 'breathing', label: '5-minute breathing exercise', pts: 20 },
  { id: 'no_social_2h', label: 'Stay off social media for 2 hours', pts: 30 },
  { id: 'write_reason', label: 'Write your reason to stay strong', pts: 25 },
  { id: 'walk', label: '10-minute outdoor walk', pts: 15 },
];

// ── Games Catalogue ──────────────────────────────────────────────

export const getGames = (_req: Request, res: Response) => {
  res.json({ games: GAMES_LIST });
};

// ── Leaderboard & Activity ───────────────────────────────────────

export const getLeaderboard = async (_req: Request, res: Response) => {
  try {
    const topPlayers = await GameState.find()
      .sort({ totalPoints: -1 })
      .limit(10)
      .select('userId totalPoints');

    const leaderboard = topPlayers.map((g, i) => ({
      rank: i + 1,
      handle: `User#${g.userId.slice(-4).toUpperCase()}`,
      points: g.totalPoints,
    }));

    res.json({ leaderboard });
  } catch {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

export const getRecentActivity = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const activities = await Activity.find({ userId }).sort({ date: -1 }).limit(5);

    res.json({
      activities: activities.map(a => ({
        gameId: a.gameId,
        date: a.date,
        sessions: a.sessions,
        pointsEarned: a.pointsEarned,
      })),
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
};

export const getScores = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const gs = await getOrCreate(userId);

    res.json({
      scores: {
        sober: { days: gs.soberDays, points: gs.soberDays * 50 },
        forest: { coins: gs.forestCoins, points: gs.forestCoins * 2 },
        habitica: { xp: gs.rpgXP, level: gs.rpgLevel },
        braver: { days: gs.braverDays, points: gs.braverDays * 40 },
      },
      totalPoints: gs.totalPoints,
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
};

// ── Sober ─────────────────────────────────────────────────────────

export const getSober = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const gs = await getOrCreate(userId);

    res.json({
      soberDays: gs.soberDays,
      pledgedToday: gs.lastPledgeDate === today(),
      moneySaved: gs.soberDays * 12,
      totalPoints: gs.totalPoints,
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch sober data' });
  }
};

export const makePledge = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const gs = await getOrCreate(userId);

    if (gs.lastPledgeDate === today()) {
      return res.status(400).json({ error: 'Already pledged today' });
    }

    gs.soberDays += 1;
    gs.lastPledgeDate = today();
    gs.totalPoints += 50;

    await gs.save();
    await logActivity(userId, 'sober', 50);

    res.json({
      soberDays: gs.soberDays,
      pledgedToday: true,
      moneySaved: gs.soberDays * 12,
      totalPoints: gs.totalPoints,
    });
  } catch {
    res.status(500).json({ error: 'Failed to make pledge' });
  }
};

export const resetSober = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const gs = await getOrCreate(userId);

    gs.soberDays = 0;
    gs.lastPledgeDate = null;
    await gs.save();

    res.json({ soberDays: 0, pledgedToday: false });
  } catch {
    res.status(500).json({ error: 'Failed to reset streak' });
  }
};

// ── Forest ────────────────────────────────────────────────────────

export const getForest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const gs = await getOrCreate(userId);

    res.json({ forestCoins: gs.forestCoins, treesGrown: Math.floor(gs.forestCoins / 10) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch forest data' });
  }
};

export const completeForest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { seconds } = req.body as { seconds: number };

    if (!seconds || seconds < 300) {
      return res.status(400).json({ error: 'Session too short (min 5 min)' });
    }

    const gs = await getOrCreate(userId);
    const coins = Math.floor(seconds / 150);
    const points = coins * 2;

    gs.forestCoins += coins;
    gs.totalPoints += points;

    await gs.save();
    await logActivity(userId, 'forest', points);

    res.json({
      forestCoins: gs.forestCoins,
      treesGrown: Math.floor(gs.forestCoins / 10),
      coinsEarned: coins,
    });
  } catch {
    res.status(500).json({ error: 'Failed to complete forest session' });
  }
};

// ── Habitica ───────────────────────────────────────────────────────

export const getHabitica = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const gs = await getOrCreate(userId);

    // Reset tasks daily
    if (gs.tasksResetDate !== today()) {
      gs.tasksDoneToday = [];
      gs.tasksResetDate = today();
      await gs.save();
    }

    res.json({
      rpgXP: gs.rpgXP,
      rpgLevel: gs.rpgLevel,
      tasks: RPG_TASKS.map(t => ({ ...t, done: gs.tasksDoneToday.includes(t.id) })),
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch habitica data' });
  }
};

export const toggleTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const task = RPG_TASKS.find(t => t.id === req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const gs = await getOrCreate(userId);

    if (gs.tasksResetDate !== today()) {
      gs.tasksDoneToday = [];
      gs.tasksResetDate = today();
    }

    const done = gs.tasksDoneToday.includes(task.id);

    if (done) {
      // Undo task
      gs.tasksDoneToday = gs.tasksDoneToday.filter(id => id !== task.id);
      gs.rpgXP = Math.max(0, gs.rpgXP - task.xp);
      gs.totalPoints = Math.max(0, gs.totalPoints - task.xp);
    } else {
      // Complete task
      gs.tasksDoneToday.push(task.id);
      gs.rpgXP += task.xp;
      gs.totalPoints += task.xp;
      gs.rpgLevel = Math.floor(gs.rpgXP / 100) + 1;
      await logActivity(userId, 'habitica', task.xp);
    }

    await gs.save();

    res.json({
      done: !done,
      rpgXP: gs.rpgXP,
      rpgLevel: gs.rpgLevel,
      tasks: RPG_TASKS.map(t => ({ ...t, done: gs.tasksDoneToday.includes(t.id) })),
    });
  } catch {
    res.status(500).json({ error: 'Failed to toggle task' });
  }
};

// ── Braver ────────────────────────────────────────────────────────

export const getBraver = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const gs = await getOrCreate(userId);

    // Reset challenges daily
    if (gs.challengesResetDate !== today()) {
      gs.challengesDoneToday = [];
      gs.challengesResetDate = today();
      await gs.save();
    }

    res.json({
      braverDays: gs.braverDays,
      checkedInToday: gs.braverLastCheckin === today(),
      challenges: CHALLENGES.map(c => ({ ...c, done: gs.challengesDoneToday.includes(c.id) })),
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch braver data' });
  }
};

export const braverCheckin = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const gs = await getOrCreate(userId);

    if (gs.braverLastCheckin === today()) {
      return res.status(400).json({ error: 'Already checked in today' });
    }

    gs.braverDays += 1;
    gs.braverLastCheckin = today();
    gs.totalPoints += 40;

    await gs.save();
    await logActivity(userId, 'braver', 40);

    res.json({ braverDays: gs.braverDays, checkedInToday: true, totalPoints: gs.totalPoints });
  } catch {
    res.status(500).json({ error: 'Failed to check in' });
  }
};

export const toggleChallenge = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const challenge = CHALLENGES.find(c => c.id === req.params.id);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    const gs = await getOrCreate(userId);

    if (gs.challengesResetDate !== today()) {
      gs.challengesDoneToday = [];
      gs.challengesResetDate = today();
    }

    const done = gs.challengesDoneToday.includes(challenge.id);

    if (done) {
      gs.challengesDoneToday = gs.challengesDoneToday.filter(id => id !== challenge.id);
      gs.totalPoints = Math.max(0, gs.totalPoints - challenge.pts);
    } else {
      gs.challengesDoneToday.push(challenge.id);
      gs.totalPoints += challenge.pts;
      await logActivity(userId, 'braver', challenge.pts);
    }

    await gs.save();

    res.json({
      done: !done,
      challenges: CHALLENGES.map(c => ({ ...c, done: gs.challengesDoneToday.includes(c.id) })),
      totalPoints: gs.totalPoints,
    });
  } catch {
    res.status(500).json({ error: 'Failed to toggle challenge' });
  }
};
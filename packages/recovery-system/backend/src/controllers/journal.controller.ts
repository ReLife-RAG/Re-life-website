import { Request, Response } from 'express';
import Journal from '../models/Journal';
import mongoose from 'mongoose';
import { getFileUrl } from '../services/upload.service';

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Safely parse a field that may arrive as a JSON string, a real array,
 * or a comma-separated string (common with multipart/form-data).
 */
function parseArrayField(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return (value as string[]).map(s => String(s).trim()).filter(Boolean);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
    } catch {
      return value.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  return [];
}

const VALID_MOODS = ['great', 'good', 'okay', 'struggling', 'relapsed'] as const;

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/journals
 * Create a new journal entry (supports optional image upload via multer)
 */
export const createEntry = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const { content, mood, triggers, copingStrategies, isPrivate } = req.body;

    // Validate required fields
    if (!content || !mood) {
      return res.status(400).json({ message: 'Content and mood are required' });
    }
    const trimmed = typeof content === 'string' ? content.trim() : '';
    if (trimmed.length < 10) {
      return res.status(400).json({ message: 'Content must be at least 10 characters' });
    }
    if (trimmed.length > 10_000) {
      return res.status(400).json({ message: 'Content must not exceed 10,000 characters' });
    }
    if (!VALID_MOODS.includes(mood)) {
      return res.status(400).json({ message: `Invalid mood. Must be one of: ${VALID_MOODS.join(', ')}` });
    }

    // Resolve image URL (works for both Cloudinary and local disk)
    const imageUrl = req.file ? getFileUrl(req.file) : undefined;

    const entry = new Journal({
      user:              userId,
      content:           trimmed,
      mood,
      triggers:          parseArrayField(triggers),
      copingStrategies:  parseArrayField(copingStrategies),
      image:             imageUrl,
      isPrivate:         isPrivate === 'true' || isPrivate === true,
    });

    const saved = await entry.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('createEntry error:', err);
    return res.status(500).json({
      message: 'Failed to create journal entry',
      error:   err instanceof Error ? err.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/journals
 * Paginated list of journal entries for the current user.
 * Query: ?page=1&limit=20&date=YYYY-MM-DD&mood=okay
 */
export const getEntries = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const { date, page = '1', limit = '20', mood } = req.query;

    const query: Record<string, unknown> = { user: userId };

    if (date && typeof date === 'string') {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end   = new Date(date); end.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: start, $lte: end };
    }

    if (mood && typeof mood === 'string' && VALID_MOODS.includes(mood as any)) {
      query.mood = mood;
    }

    const pageNum  = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 20));
    const skip     = (pageNum - 1) * limitNum;

    const [entries, total] = await Promise.all([
      Journal.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).select('-__v'),
      Journal.countDocuments(query),
    ]);

    return res.status(200).json({
      entries,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error('getEntries error:', err);
    return res.status(500).json({ message: 'Failed to fetch journals', error: err instanceof Error ? err.message : 'Unknown error' });
  }
};

/**
 * GET /api/journals/stats
 * Aggregated writing stats for the current user.
 * IMPORTANT: route must be registered BEFORE /journals/:id
 */
export const getStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const userObjId = new mongoose.Types.ObjectId(userId);

    const [totals, moodDist, streakDays] = await Promise.all([
      Journal.aggregate([
        { $match: { user: userObjId } },
        { $group: { _id: null, total: { $sum: 1 }, contents: { $push: '$content' } } },
      ]),
      Journal.aggregate([
        { $match: { user: userObjId } },
        { $group: { _id: '$mood', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Journal.aggregate([
        { $match: { user: userObjId } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } } },
        { $sort: { _id: -1 } },
      ]),
    ]);

    const total      = totals[0]?.total ?? 0;
    const totalWords = (totals[0]?.contents ?? []).reduce(
      (sum: number, c: string) => sum + (c?.trim().split(/\s+/).filter(Boolean).length ?? 0), 0,
    );
    const topMood    = moodDist[0]?._id ?? null;

    // Writing streak (consecutive days with at least one entry)
    let streak = 0;
    const cursor = new Date(); cursor.setHours(0, 0, 0, 0);
    for (const { _id: day } of streakDays) {
      if (day === cursor.toISOString().split('T')[0]) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else break;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const todayCount = (streakDays[0]?._id === todayStr) ? 1 : 0;

    return res.status(200).json({
      total,
      totalWords,
      topMood,
      writingStreak: streak,
      todayEntries:  todayCount,
      moodDistribution: moodDist.reduce((acc: Record<string, number>, item: { _id: string; count: number }) => {
        acc[item._id] = item.count; return acc;
      }, {}),
    });
  } catch (err) {
    console.error('getStats error:', err);
    return res.status(500).json({ message: 'Failed to get journal stats', error: err instanceof Error ? err.message : 'Unknown error' });
  }
};

/**
 * GET /api/journals/:id
 */
export const getEntryById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid entry ID' });

    const entry = await Journal.findOne({ _id: id, user: userId });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    return res.status(200).json(entry);
  } catch (err) {
    console.error('getEntryById error:', err);
    return res.status(500).json({ message: 'Failed to fetch entry', error: err instanceof Error ? err.message : 'Unknown error' });
  }
};

/**
 * PATCH /api/journals/:id
 */
export const updateEntry = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid entry ID' });

    const { content, mood, triggers, copingStrategies, isPrivate } = req.body;

    if (content !== undefined) {
      const trimmed = typeof content === 'string' ? content.trim() : '';
      if (trimmed.length < 10)     return res.status(400).json({ message: 'Content must be at least 10 characters' });
      if (trimmed.length > 10_000) return res.status(400).json({ message: 'Content must not exceed 10,000 characters' });
    }
    if (mood !== undefined && !VALID_MOODS.includes(mood)) {
      return res.status(400).json({ message: `Invalid mood. Must be one of: ${VALID_MOODS.join(', ')}` });
    }

    const entry = await Journal.findOne({ _id: id, user: userId });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    if (content          !== undefined) entry.content          = content.trim();
    if (mood             !== undefined) entry.mood             = mood;
    if (triggers         !== undefined) entry.triggers         = parseArrayField(triggers);
    if (copingStrategies !== undefined) entry.copingStrategies = parseArrayField(copingStrategies);
    if (isPrivate        !== undefined) entry.isPrivate        = isPrivate === 'true' || isPrivate === true;
    if (req.file)                       entry.image            = getFileUrl(req.file);

    const updated = await entry.save();
    return res.status(200).json(updated);
  } catch (err) {
    console.error('updateEntry error:', err);
    return res.status(500).json({ message: 'Failed to update entry', error: err instanceof Error ? err.message : 'Unknown error' });
  }
};

/**
 * DELETE /api/journals/:id
 */
export const deleteEntry = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid entry ID' });

    const entry = await Journal.findOneAndDelete({ _id: id, user: userId });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    return res.status(200).json({ message: 'Entry deleted successfully' });
  } catch (err) {
    console.error('deleteEntry error:', err);
    return res.status(500).json({ message: 'Failed to delete entry', error: err instanceof Error ? err.message : 'Unknown error' });
  }
};
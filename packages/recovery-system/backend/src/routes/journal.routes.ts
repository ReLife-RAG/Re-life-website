import { Router } from 'express';
import {
  createEntry,
  getEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
  getStats,
} from '../controllers/journal.controller';
import upload from '../services/upload.service';
import { isAuth } from '../middleware/isAuth';

const router = Router();

// All journal routes require authentication
router.use(isAuth);

// ── /stats must come BEFORE /:id so it isn't captured as an ID param ─────────
router.get('/journals/stats', getStats);

router.get('/journals',       getEntries);
router.post('/journals',      upload.single('image'), createEntry);

router.get('/journals/:id',   getEntryById);
router.patch('/journals/:id', upload.single('image'), updateEntry);
router.delete('/journals/:id', deleteEntry);

export default router;
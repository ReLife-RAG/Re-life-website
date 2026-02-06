import express from 'express';
import Counselor from '../models/Counselor';

const router = express.Router();

// GET /api/counselors – list all active counselors
router.get('/counselors', async (req, res) => {
  try {
    const counselors = await Counselor.find({ isActive: true });
    res.status(200).json(counselors);
  } catch (err) {
    console.error('Error fetching counselors:', err);
    res.status(500).json({ message: 'Server error fetching counselors' });
  }
});

export default router;
import { Router } from 'express';
import { createEntry, getEntries, getEntryById, updateEntry, deleteEntry } from '../controllers/journal.controller';
import upload from '../services/upload.service';
import { isAuth } from '../middleware/isAuth'; 

const router = Router();

router.post('/', isAuth, upload.single('image'), createEntry);
router.get('/', isAuth, getEntries);
router.get('/:id', isAuth, getEntryById);
router.patch('/:id', isAuth, upload.single('image'), updateEntry); // Image upload for updates
router.delete('/:id', isAuth, deleteEntry);

export default router;
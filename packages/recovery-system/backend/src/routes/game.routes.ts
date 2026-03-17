import express from 'express';
import { isAuth } from '../middleware/isAuth';
import * as game from '../controllers/game.controller';

const router = express.Router();

// Games catalogue (public)
router.get('/games', game.getGames);

// Leaderboard & Activity (protected)
router.get('/games/leaderboard',     isAuth, game.getLeaderboard);
router.get('/games/activity/recent', isAuth, game.getRecentActivity);
router.get('/games/scores',          isAuth, game.getScores);

// Sober
router.get( '/games/sober',        isAuth, game.getSober);
router.post('/games/sober/pledge', isAuth, game.makePledge);
router.post('/games/sober/reset',  isAuth, game.resetSober);

// Forest
router.get( '/games/forest',          isAuth, game.getForest);
router.post('/games/forest/complete', isAuth, game.completeForest);

// Habitica
router.get( '/games/habitica',              isAuth, game.getHabitica);
router.post('/games/habitica/task/:taskId', isAuth, game.toggleTask);

// Braver
router.get( '/games/braver',               isAuth, game.getBraver);
router.post('/games/braver/checkin',       isAuth, game.braverCheckin);
router.post('/games/braver/challenge/:id', isAuth, game.toggleChallenge);

export default router;
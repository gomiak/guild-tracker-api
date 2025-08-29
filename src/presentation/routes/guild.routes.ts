import { Router } from 'express';
import { guildController } from '../../config/di-container';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

router.get('/health', guildController.healthCheck);
router.get('/data', requireAuth, guildController.getGuildAnalysis);

export default router;

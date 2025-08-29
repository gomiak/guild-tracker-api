import { Router } from 'express';
import { guildController } from '../../config/di-container';

const router = Router();

router.get('/health', guildController.healthCheck);
router.get('/data', guildController.getGuildAnalysis);

export default router;

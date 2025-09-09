import express from 'express';
import { GuildService } from '../../application/services/guild.service';
import { GuildRepository } from '../../infrastructure/repositories/guild.repository';
import { tibiaDataCache, analysisCache } from '../../lib/cache';
import { GuildController } from '../controllers/guild.controller';

const router = express.Router();

router.get('/data', async (req, res) => {
    try {
        const guildService = new GuildService(new GuildRepository());
        const data = await guildService.getFullGuildAnalysis();

        res.json(data);
    } catch (error) {
        console.error('Erro na rota /data:', error);
        res.status(500).json({
            error: 'Erro ao buscar dados da guilda',
            details:
                error instanceof Error ? error.message : 'Erro desconhecido',
        });
    }
});

router.get('/force-refresh', async (req, res) => {
    try {
        tibiaDataCache.flushAll();
        analysisCache.flushAll();

        const guildService = new GuildService(new GuildRepository());
        const data = await guildService.getFullGuildAnalysis();

        res.json({
            ...data,
            cache: 'refreshed',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao forçar atualização' });
    }
});

router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        cache: {
            tibiaData: tibiaDataCache.getStats(),
            analysis: analysisCache.getStats(),
        },
    });
});

// Rotas para marcar/desmarcar membros como exitados
const guildController = new GuildController(
    new GuildService(new GuildRepository()),
);

router.post('/mark-exited/:memberName', guildController.markMemberAsExited);
router.post('/unmark-exited/:memberName', guildController.unmarkMemberAsExited);

export default router;

import express from 'express';
import { GuildService } from '../../application/services/guild.service';
import { GuildRepository } from '../../infrastructure/repositories/guild.repository';
import { tibiaDataCache, analysisCache } from '../../lib/cache';

const router = express.Router();

router.get('/data', async (req, res) => {
    try {
        const guildService = new GuildService(new GuildRepository());
        const data = await guildService.getFullGuildAnalysis();

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar dados da guilda' });
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

export default router;

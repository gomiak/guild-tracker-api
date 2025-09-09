import { Request, Response } from 'express';
import { GuildService } from '../../application/services/guild.service';
import { IGuildRepository } from '../../domain/entities/repositories/guild.repository';
import { GuildRepository } from '../../infrastructure/repositories/guild.repository';

export class ExternalCharacterController {
    private guildService: GuildService;

    constructor() {
        const guildRepository: IGuildRepository = new GuildRepository();
        this.guildService = new GuildService(guildRepository);
    }

    async addExternalCharacter(req: Request, res: Response): Promise<void> {
        try {
            const { name } = req.body;

            if (!name || typeof name !== 'string' || name.trim().length === 0) {
                res.status(400).json({
                    error: 'Nome do personagem é obrigatório',
                });
                return;
            }

            if (name.length > 50) {
                res.status(400).json({
                    error: 'Nome do personagem deve ter no máximo 50 caracteres',
                });
                return;
            }

            await this.guildService.addExternalCharacter(name.trim());
            res.json({ message: 'Personagem adicionado com sucesso' });
        } catch (error: any) {
            console.error('Error adding external character:', error);
            res.status(500).json({
                error: error.message || 'Erro interno do servidor',
            });
        }
    }

    async removeExternalCharacter(req: Request, res: Response): Promise<void> {
        try {
            const { name } = req.params;

            if (!name || typeof name !== 'string' || name.trim().length === 0) {
                res.status(400).json({
                    error: 'Nome do personagem é obrigatório',
                });
                return;
            }

            await this.guildService.removeExternalCharacter(name.trim());
            res.json({ message: 'Personagem removido com sucesso' });
        } catch (error: any) {
            console.error('Error removing external character:', error);
            res.status(500).json({
                error: error.message || 'Erro interno do servidor',
            });
        }
    }

    async getExternalCharacters(req: Request, res: Response): Promise<void> {
        try {
            const characters = await this.guildService.getExternalCharacters();
            res.json(characters);
        } catch (error: any) {
            console.error('Error getting external characters:', error);
            res.status(500).json({
                error: error.message || 'Erro interno do servidor',
            });
        }
    }

    async markAsExited(req: Request, res: Response): Promise<void> {
        try {
            const { name } = req.params;

            if (!name || typeof name !== 'string' || name.trim().length === 0) {
                res.status(400).json({
                    error: 'Nome do personagem é obrigatório',
                });
                return;
            }

            await this.guildService.markExternalCharacterAsExited(name.trim());
            res.json({ message: 'Personagem marcado como exitado' });
        } catch (error: any) {
            console.error('Error marking external character as exited:', error);
            res.status(500).json({
                error: error.message || 'Erro interno do servidor',
            });
        }
    }

    async unmarkAsExited(req: Request, res: Response): Promise<void> {
        try {
            const { name } = req.params;

            if (!name || typeof name !== 'string' || name.trim().length === 0) {
                res.status(400).json({
                    error: 'Nome do personagem é obrigatório',
                });
                return;
            }

            await this.guildService.unmarkExternalCharacterAsExited(
                name.trim(),
            );
            res.json({ message: 'Personagem desmarcado como exitado' });
        } catch (error: any) {
            console.error(
                'Error unmarking external character as exited:',
                error,
            );
            res.status(500).json({
                error: error.message || 'Erro interno do servidor',
            });
        }
    }

    async syncExternalCharacters(req: Request, res: Response): Promise<void> {
        try {
            await this.guildService.syncExternalCharacters();
            res.json({
                message: 'Personagens externos sincronizados com sucesso',
            });
        } catch (error: any) {
            console.error('Error syncing external characters:', error);
            res.status(500).json({
                error: error.message || 'Erro interno do servidor',
            });
        }
    }

    async getCombinedData(req: Request, res: Response): Promise<void> {
        try {
            const data = await this.guildService.getCombinedGuildAnalysis();
            res.json(data);
        } catch (error: any) {
            console.error('Error getting combined data:', error);
            res.status(500).json({
                error: error.message || 'Erro interno do servidor',
            });
        }
    }
}

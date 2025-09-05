import { Request, Response } from 'express';
import { GuildService } from '../../application/services/guild.service';

export class GuildController {
    constructor(private guildService: GuildService) {}

    getGuildAnalysis = async (req: Request, res: Response): Promise<void> => {
        try {
            const analysis = await this.guildService.getFullGuildAnalysis();
            res.json(analysis);
        } catch (error) {
            console.error('Error in getGuildAnalysis:', error);
            res.status(500).json({ error: 'Failed to analyze guild data' });
        }
    };

    healthCheck = async (req: Request, res: Response): Promise<void> => {
        res.json({
            status: 'OK',
            message: 'Guild API is running',
            timestamp: new Date().toISOString(),
        });
    };

    markMemberAsExited = async (req: Request, res: Response): Promise<void> => {
        try {
            const { memberName } = req.params;
            await this.guildService.markMemberAsExited(memberName);
            res.json({ success: true, message: 'Membro marcado como exitado' });
        } catch (error) {
            console.error('Error marking member as exited:', error);
            res.status(500).json({ error: 'Failed to mark member as exited' });
        }
    };

    unmarkMemberAsExited = async (
        req: Request,
        res: Response,
    ): Promise<void> => {
        try {
            const { memberName } = req.params;
            await this.guildService.unmarkMemberAsExited(memberName);
            res.json({
                success: true,
                message: 'Membro desmarcado como exitado',
            });
        } catch (error) {
            console.error('Error unmarking member as exited:', error);
            res.status(500).json({
                error: 'Failed to unmark member as exited',
            });
        }
    };
}

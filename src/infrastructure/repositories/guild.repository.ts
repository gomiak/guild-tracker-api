import { IGuildRepository } from '../../domain/entities/repositories/guild.repository';
import { Guild } from '../../domain/entities/guild.entity';

export class GuildRepository implements IGuildRepository {
    private readonly API_URL =
        'https://api.tibiadata.com/v4/guild/felizes%20para%20sempre';

    async getGuildData(): Promise<Guild> {
        try {
            const response = await fetch(this.API_URL);

            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }

            const apiData = await response.json();
            return this.mapToDomain(apiData);
        } catch (error) {
            console.error('Error fetching guild data:', error);
            throw new Error('Failed to fetch guild data');
        }
    }

    private mapToDomain(apiData: any): Guild {
        return {
            name: apiData.guild.name,
            members: apiData.guild.members.map((member: any) => ({
                name: member.name,
                level: member.level,
                vocation: member.vocation,
                status: member.status,
            })),
            playersOnline: apiData.guild.players_online,
            playersOffline: apiData.guild.players_offline,
            membersTotal: apiData.guild.members_total,
        };
    }
}

import { IGuildRepository } from '../../domain/entities/repositories/guild.repository';
import { Guild } from '../../domain/entities/guild.entity';
import { prisma } from '../../lib/prisma';
import { GuildMember } from '../../domain/entities/guild.entity';

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

            await this.syncMembersToDatabase(apiData.guild.members);

            return this.mapToDomain(apiData);
        } catch (error) {
            console.error('Error fetching guild data:', error);
            throw new Error('Failed to fetch guild data');
        }
    }

    private async syncMembersToDatabase(members: any[]): Promise<void> {
        for (const member of members) {
            try {
                await prisma.guildMember.upsert({
                    where: { name: member.name },
                    update: {
                        level: member.level,
                        vocation: member.vocation,
                        status: member.status,
                        lastSeen: new Date(),
                    },
                    create: {
                        name: member.name,
                        level: member.level,
                        vocation: member.vocation,
                        status: member.status,
                        lastSeen: new Date(),
                    },
                });
            } catch (error) {
                console.error(`Error syncing member ${member.name}:`, error);
            }
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
                lastSeen: new Date(),
            })),
            playersOnline: apiData.guild.players_online,
            playersOffline: apiData.guild.players_offline,
            membersTotal: apiData.guild.members_total,
        };
    }
    async getMembersFromDatabase(): Promise<GuildMember[]> {
        return prisma.guildMember.findMany();
    }

    async getOnlineMembersFromDatabase(): Promise<GuildMember[]> {
        return prisma.guildMember.findMany({
            where: { status: 'online' },
        });
    }

    async getMemberByName(name: string): Promise<GuildMember | null> {
        return prisma.guildMember.findUnique({
            where: { name },
        });
    }
}

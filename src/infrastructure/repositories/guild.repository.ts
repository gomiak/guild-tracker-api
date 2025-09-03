import { IGuildRepository } from '../../domain/entities/repositories/guild.repository';
import { Guild } from '../../domain/entities/guild.entity';
import { prisma } from '../../lib/prisma';
import { GuildMember } from '../../domain/entities/guild.entity';

export class GuildRepository implements IGuildRepository {
    private readonly API_URL: string;

    constructor() {
        this.API_URL = 'https://api.tibiadata.com/v4/guild/penumbra%20pune';
    }

    async getGuildData(): Promise<Guild> {
        try {
            const response = await fetch(this.API_URL);

            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }

            const apiData = await response.json();

            await this.syncMembersToDatabase(apiData.guild.members);

            return await this.mapToDomain(apiData);
        } catch (error) {
            console.error('Error fetching guild data:', error);
            throw new Error('Failed to fetch guild data');
        }
    }

    private async syncMembersToDatabase(members: any[]): Promise<void> {
        const dbMembers = await prisma.guildMember.findMany();
        const dbMembersMap = new Map(dbMembers.map((m) => [m.name, m]));

        const transactions = [];

        for (const member of members) {
            const existingMember = dbMembersMap.get(member.name);

            let updateData: any = {
                level: member.level,
                vocation: member.vocation,
                status: member.status,
            };

            if (member.status === 'online') {
                if (!existingMember || existingMember.status === 'offline') {
                    updateData.lastSeen = new Date();
                }
            } else {
                updateData.lastSeen = null;
                await prisma.memberMessage.deleteMany({
                    where: { name: member.name },
                });
            }

            transactions.push(
                prisma.guildMember.upsert({
                    where: { name: member.name },
                    update: updateData,
                    create: {
                        name: member.name,
                        ...updateData,
                        lastSeen: updateData.lastSeen ?? new Date(),
                    },
                }),
            );
        }

        await prisma.$transaction(transactions);
    }

    private async mapToDomain(apiData: any): Promise<Guild> {
        try {
            const onlineMembers = await prisma.guildMember.findMany({
                where: {
                    status: 'online',
                    lastSeen: { not: null as any },
                },
            });

            const onlineMembersMap = new Map(
                onlineMembers.map((m) => [m.name, m.lastSeen]),
            );

            return {
                name: apiData.guild.name,
                members: apiData.guild.members
                    .filter((member: any) => member.status === 'online')
                    .map((member: any) => ({
                        name: member.name,
                        level: member.level,
                        vocation: member.vocation,
                        status: member.status,
                        lastSeen:
                            onlineMembersMap.get(member.name) || new Date(),
                    })),
                playersOnline: apiData.guild.players_online,
                playersOffline: apiData.guild.players_offline,
                membersTotal: apiData.guild.members_total,
            };
        } catch (error) {
            console.error('Error in mapToDomain:', error);
            throw error;
        }
    }

    async getMembersFromDatabase(): Promise<GuildMember[]> {
        return prisma.guildMember.findMany();
    }

    async getOnlineMembersFromDatabase(): Promise<GuildMember[]> {
        return prisma.guildMember.findMany({
            where: {
                status: 'online',
                lastSeen: { not: null as any },
            },
        });
    }

    async getMemberByName(name: string): Promise<GuildMember | null> {
        return prisma.guildMember.findUnique({
            where: { name },
        });
    }

    async cleanupOfflineMembersMessages(): Promise<void> {
        try {
            const offlineMembers = await prisma.guildMember.findMany({
                where: { status: 'offline' },
            });

            for (const member of offlineMembers) {
                await prisma.memberMessage.deleteMany({
                    where: { name: member.name },
                });
            }
        } catch (error) {
            console.error('Erro ao limpar observações:', error);
        }
    }
}

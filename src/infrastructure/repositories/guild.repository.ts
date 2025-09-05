import { IGuildRepository } from '../../domain/entities/repositories/guild.repository';
import { Guild } from '../../domain/entities/guild.entity';
import { prisma } from '../../lib/prisma';
import { GuildMember } from '../../domain/entities/guild.entity';

interface DatabaseMember {
    name: string;
    level: number;
    vocation: string;
    status: string;
    lastSeen: Date | null;
    isExited: boolean;
}

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
        const dbMembers =
            (await prisma.guildMember.findMany()) as unknown as DatabaseMember[];
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
            const onlineMembers = (await prisma.guildMember.findMany({
                where: {
                    status: 'online',
                    lastSeen: { not: null },
                },
            })) as unknown as DatabaseMember[];

            const onlineMembersMap = new Map(
                onlineMembers.map((m) => [m.name, m.lastSeen]),
            );

            // Buscar todos os membros do banco para incluir o campo isExited
            const allDbMembers = await prisma.guildMember.findMany();
            const dbMembersMap = new Map(
                allDbMembers.map((m: any) => [m.name, m]),
            );

            return {
                name: apiData.guild.name,
                members: apiData.guild.members
                    .filter((member: any) => member.status === 'online')
                    .map((member: any) => {
                        const dbMember = dbMembersMap.get(member.name);
                        return {
                            name: member.name,
                            level: member.level,
                            vocation: member.vocation,
                            status: member.status,
                            lastSeen:
                                onlineMembersMap.get(member.name) || new Date(),
                            isExited: (dbMember as any)?.isExited || false,
                        };
                    }),
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
        const members =
            (await prisma.guildMember.findMany()) as unknown as DatabaseMember[];
        return members.map((m) => ({
            name: m.name,
            level: m.level,
            vocation: m.vocation,
            status: m.status,
            lastSeen: m.lastSeen || new Date(),
            isExited: m.isExited,
        }));
    }

    async getOnlineMembersFromDatabase(): Promise<GuildMember[]> {
        const members = (await prisma.guildMember.findMany({
            where: {
                status: 'online',
                lastSeen: { not: null },
            },
        })) as unknown as DatabaseMember[];

        return members.map((m) => ({
            name: m.name,
            level: m.level,
            vocation: m.vocation,
            status: m.status,
            lastSeen: m.lastSeen || new Date(),
            isExited: m.isExited,
        }));
    }

    async getMemberByName(name: string): Promise<GuildMember | null> {
        const member = (await prisma.guildMember.findUnique({
            where: { name },
        })) as unknown as DatabaseMember | null;

        if (!member) return null;

        return {
            name: member.name,
            level: member.level,
            vocation: member.vocation,
            status: member.status,
            lastSeen: member.lastSeen || new Date(),
            isExited: member.isExited,
        };
    }

    async cleanupOfflineMembersMessages(): Promise<void> {
        try {
            const offlineMembers = (await prisma.guildMember.findMany({
                where: { status: 'offline' },
            })) as unknown as DatabaseMember[];

            for (const member of offlineMembers) {
                await prisma.memberMessage.deleteMany({
                    where: { name: member.name },
                });
            }
        } catch (error) {
            console.error('Erro ao limpar observações:', error);
        }
    }

    async markMemberAsExited(memberName: string): Promise<void> {
        try {
            await prisma.guildMember.update({
                where: { name: memberName },
                data: { isExited: true },
            });
        } catch (error) {
            console.error('Erro ao marcar membro como exitado:', error);
            throw error;
        }
    }

    async unmarkMemberAsExited(memberName: string): Promise<void> {
        try {
            await prisma.guildMember.update({
                where: { name: memberName },
                data: { isExited: false },
            });
        } catch (error) {
            console.error('Erro ao desmarcar membro como exitado:', error);
            throw error;
        }
    }
}

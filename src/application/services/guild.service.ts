import { IGuildRepository } from '../../domain/entities/repositories/guild.repository';
import { Guild, GuildMember } from '../../domain/entities/guild.entity';
import { prisma } from '../../lib/prisma';
import { tibiaDataCache, analysisCache } from '../../lib/cache';

export class GuildService {
    constructor(private guildRepository: IGuildRepository) {}

    private async getGuildDataWithCache(): Promise<Guild> {
        const CACHE_KEY = 'tibiadata-fresh';
        const cached = tibiaDataCache.get<Guild>(CACHE_KEY);

        if (cached) {
            return cached;
        }

        try {
            const freshData = await this.guildRepository.getGuildData();
            tibiaDataCache.set(CACHE_KEY, freshData);
            return freshData;
        } catch (error) {
            console.error('Erro ao buscar dados da guild:', error);
            if (cached) {
                return cached;
            }
            throw error;
        }
    }

    async getGuildData(): Promise<Guild> {
        return this.getGuildDataWithCache();
    }

    async getFullGuildAnalysis() {
        const CACHE_KEY = 'guild-analysis';
        const cached = analysisCache.get<any>(CACHE_KEY);

        if (cached) {
            return cached;
        }

        const guild = await this.guildRepository.getGuildData();

        // Query otimizada: buscar apenas membros online com status de exitado
        const onlineMembersData = (await prisma.guildMember.findMany({
            where: {
                status: 'online',
                lastSeen: { not: null },
            },
            select: {
                name: true,
                level: true,
                vocation: true,
                status: true,
                lastSeen: true,
                isExited: true,
            },
        })) as Array<{
            name: string;
            level: number;
            vocation: string;
            status: string;
            lastSeen: Date | null;
            isExited: boolean;
        }>;

        const dbMembersMap = new Map(onlineMembersData.map((m) => [m.name, m]));

        // Fazer a junção: API externa + dados do banco (incluindo isExited)
        const enrichedMembers = guild.members.map((member: GuildMember) => {
            const dbMember = dbMembersMap.get(member.name);
            return {
                ...member,
                isExited: dbMember?.isExited || false,
                lastSeen: dbMember?.lastSeen || new Date(),
            };
        });

        // Filtrar membros online (não offline e não exitados)
        const onlineMembers = enrichedMembers.filter(
            (m: GuildMember) => m.status !== 'offline' && !m.isExited,
        );

        // Membros exitados que estão online (já filtrados na query)
        const exitedMembers = onlineMembersData
            .filter((m) => m.isExited)
            .map((m) => ({
                name: m.name,
                level: m.level,
                vocation: m.vocation,
                status: m.status,
                lastSeen: m.lastSeen || new Date(),
                isExited: m.isExited,
            }));

        const analysis = {
            info: {
                name: guild.name,
                online: onlineMembers.length,
                offline: guild.playersOffline,
                total: guild.playersOffline,
            },
            vocations: this.groupByVocation(onlineMembers, true),
            exitedVocations: this.groupByVocation(exitedMembers, true),
            byLevel: this.splitByLevel(onlineMembers),
            sorted: this.sortByLevelDesc(onlineMembers),
            exitedByLevel: this.splitByLevel(exitedMembers),
            exitedSorted: this.sortByLevelDesc(exitedMembers),
            lastUpdated: new Date().toISOString(),
        };

        analysisCache.set(CACHE_KEY, analysis);
        return analysis;
    }

    filterExitedMembers(members: GuildMember[]): GuildMember[] {
        return members.filter((m) => m.isExited);
    }

    groupByVocation(
        members: GuildMember[],
        groupSimilar = false,
    ): Record<string, GuildMember[]> {
        if (!groupSimilar) {
            return members.reduce((acc, m) => {
                if (!acc[m.vocation]) acc[m.vocation] = [];
                acc[m.vocation].push(m);
                return acc;
            }, {} as Record<string, GuildMember[]>);
        }
        const VOCATION_GROUPS = {
            Druid: ['Druid', 'Elder Druid'],
            Knight: ['Knight', 'Elite Knight'],
            Sorcerer: ['Sorcerer', 'Master Sorcerer'],
            Paladin: ['Paladin', 'Royal Paladin'],
            Monk: ['Monk', 'Exalted Monk'],
        };

        return members.reduce((acc, member) => {
            let groupName = member.vocation;

            for (const [group, vocations] of Object.entries(VOCATION_GROUPS)) {
                if (vocations.includes(member.vocation)) {
                    groupName = group;
                    break;
                }
            }

            if (!acc[groupName]) acc[groupName] = [];
            acc[groupName].push(member);
            return acc;
        }, {} as Record<string, GuildMember[]>);
    }
    splitByLevel(members: GuildMember[], levelThreshold = 400) {
        const above = members.filter((m) => m.level >= levelThreshold);
        const below = members.filter((m) => m.level < levelThreshold);
        return { above, below };
    }
    sortByLevelDesc(members: GuildMember[]) {
        return [...members].sort((a, b) => b.level - a.level);
    }

    async getHistoricalData() {
        const allMembers = await prisma.guildMember.findMany();

        return {
            totalMembers: allMembers.length,
            averageLevel:
                allMembers.reduce(
                    (sum: number, m: GuildMember) => sum + m.level,
                    0,
                ) / allMembers.length,
            vocationDistribution: this.groupByVocation(allMembers, true),
        };
    }

    async cleanupOfflineMessages(): Promise<void> {
        await this.guildRepository.cleanupOfflineMembersMessages();
    }

    async markMemberAsExited(memberName: string): Promise<void> {
        await this.guildRepository.markMemberAsExited(memberName);
        analysisCache.flushAll();
    }

    async unmarkMemberAsExited(memberName: string): Promise<void> {
        await this.guildRepository.unmarkMemberAsExited(memberName);
        analysisCache.flushAll();
    }
}

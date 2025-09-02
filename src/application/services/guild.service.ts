import { IGuildRepository } from '../../domain/entities/repositories/guild.repository';
import { Guild, GuildMember } from '../../domain/entities/guild.entity';
import { prisma } from '../../lib/prisma';

export class GuildService {
    constructor(private guildRepository: IGuildRepository) {}

    async getGuildData(): Promise<Guild> {
        const guildData = await this.guildRepository.getGuildData();

        for (const member of guildData.members) {
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
        }

        return guildData;
    }

    filterOnlineMembers(members: GuildMember[]): GuildMember[] {
        return members.filter((m) => m.status !== 'offline');
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

    async getFullGuildAnalysis() {
        const guild = await this.getGuildData();
        const onlineMembers = this.filterOnlineMembers(guild.members);

        return {
            info: {
                name: guild.name,
                online: onlineMembers.length,
                offline: guild.members.length - onlineMembers.length,
                total: guild.members.length,
            },
            vocations: this.groupByVocation(onlineMembers, true),
            byLevel: this.splitByLevel(onlineMembers),
            sorted: this.sortByLevelDesc(onlineMembers),
        };
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
}

import { Guild } from '../guild.entity';

export interface IGuildRepository {
    getGuildData(): Promise<Guild>;
    cleanupOfflineMembersMessages(): Promise<void>;
}

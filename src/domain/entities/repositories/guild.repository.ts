import { Guild } from '../guild.entity';

export interface IGuildRepository {
    getGuildData(): Promise<Guild>;
    cleanupOfflineMembersMessages(): Promise<void>;
    markMemberAsExited(memberName: string): Promise<void>;
    unmarkMemberAsExited(memberName: string): Promise<void>;
}

export interface GuildMember {
    name: string;
    vocation: string;
    level: number;
    status: string;
    lastSeen: Date | null;
    isExited: boolean;
}

export interface Guild {
    name: string;
    playersOnline: number;
    playersOffline: number;
    membersTotal: number;
    members: GuildMember[];
}

export interface GuildResponse {
    guild: Guild;
}

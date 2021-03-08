export interface GuildSettings {
    prefix: string;
    adminRole: string;
    supportRole: string;
    embedColor: string;
    supportMsgChannel: string;
    adminChannel: string;
    supportMsg: string;
    [key: string]: string;
}

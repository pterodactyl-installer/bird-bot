export interface GuildSettings {
  prefix: string;
  adminRole: string;
  supportRole: string;
  embedColor: string;
  supportMsgChannel: string;
  supportMsg: string;
  adminChannel: string;
  supportChannel: string;
  [key: string]: string;
}

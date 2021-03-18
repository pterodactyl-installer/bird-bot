export interface GuildSettings {
  prefix: string;
  supportRole: string;
  embedColor: string;
  supportMsgChannel: string;
  supportMsg: string;
  logsChannel: string;
  supportChannel: string;
  [key: string]: string;
}

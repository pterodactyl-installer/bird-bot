import { User } from "discord.js";
import { GuildSettings } from "./GuildSettings";

export interface ApiData {
  channel: string;
  adminChannel: string;
  guild: string;
  user: User;
  settings: GuildSettings;
}

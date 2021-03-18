import { User } from "discord.js";
import { GuildSettings } from "./GuildSettings";

export interface ApiData {
  channel: string;
  user: User;
  settings: GuildSettings;
}

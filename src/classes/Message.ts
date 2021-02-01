import { Message as DiscordMessage } from 'discord.js';
import { Bot } from '../client/client';
import { GuildSettings } from '../interfaces/GuildSettings';

class Message extends DiscordMessage {
    public settings!: GuildSettings;
    public client!: Bot;
}

export { Message };

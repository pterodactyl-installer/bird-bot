import { Guild } from 'discord.js';
import { RunFunction } from '../interfaces/Event';
export const name: string = 'guildDelete';
export const run: RunFunction = async (client, guild: Guild) => {
    if (!guild.available) return; // If there is an outage, return.
    client.logger(
        `[GUILD LEAVE] ${guild.name} (${guild.id}) removed the bot.`,
        'cmd'
    );
    // Remove guilds data
    if (client.settings.has(guild.id)) {
        client.settings.delete(guild.id);
    }
};

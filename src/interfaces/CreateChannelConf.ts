import { GuildCreateChannelOptions } from 'discord.js';

export interface ChannelConf {
    name: string;
    options: GuildCreateChannelOptions;
}

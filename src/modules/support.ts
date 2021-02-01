import { Guild, TextChannel, User } from 'discord.js';
import { Bot } from '../client/client';
import { GuildSettings } from '../interfaces/GuildSettings';
import { apiStart } from './api';

export const startSupport = async (
    client: Bot,
    guild: Guild,
    user: User,
    settings: GuildSettings
): Promise<unknown> => {
    try {
        if (!guild.me!.hasPermission('MANAGE_CHANNELS'))
            return client.logger(
                `Bot doesn't have permissions to create a channel!`,
                'error'
            );
        if (guild.channels.cache.some((c) => c.name === user.username)) return;
        let category = await guild.channels.create(user.username, {
            type: 'category',
            permissionOverwrites: [
                { id: guild.roles.everyone, deny: ['VIEW_CHANNEL'] },
                { id: user, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'] },
                {
                    id: client.user!.id,
                    allow: ['MANAGE_CHANNELS', 'VIEW_CHANNEL'],
                },
            ],
            reason: `Support for ${user.tag}`,
        });
        let channel = await guild.channels.create('support', {
            type: 'text',
            topic: `Support for ${user.username}`,
            parent: category,
            reason: `Support for ${user.tag}`,
        });
        let adminChannel = guild.channels.cache.find(
            (c) => c.name.toLowerCase() === settings.adminChannel
        );
        apiStart(
            client,
            channel,
            adminChannel as TextChannel,
            category,
            guild,
            user,
            settings
        );
    } catch (error) {
        client.logger(error, 'error');
        if (guild.channels.cache.some((c) => c.name === user.username)) {
            let channel = guild.channels.cache.find(
                (c) => c.parent?.name === user.username
            );
            channel?.fetch(true);
            if (!channel?.deleted) channel?.delete('Error');
            if (!channel?.parent?.deleted) channel?.parent?.delete('Error');
        }
    }
};

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { MessageReaction, User } from 'discord.js';
import { RunFunction } from '../interfaces/Command';
import { startSupport } from '../modules/support';

export const run: RunFunction = async (client, message, args) => {
    if (args.length < 2)
        return message.reply('Must provide 2 channel names! (support) (admin)');
    const channel = await client.functions.createTextChannel(message, {
        name: args[0],
        options: { topic: 'Support', reason: 'Support' },
    });
    const adminChannel = await client.functions.createTextChannel(message, {
        name: args[1],
        options: {
            topic: 'Support admin',
            reason: 'Support admin',
            permissionOverwrites: [
                { id: message.guild!.roles.everyone, deny: ['VIEW_CHANNEL'] },
                {
                    id: client.user!.id,
                    allow: ['MANAGE_CHANNELS', 'VIEW_CHANNEL'],
                },
                {
                    id: message.guild!.roles.cache.find(
                        (r) => r.name === message.settings.supportRole
                    )!,
                    allow: ['VIEW_CHANNEL'],
                },
            ],
        },
    });
    if (typeof channel === 'undefined') return;
    if (typeof adminChannel === 'undefined') return;
    client.settings.set(message.guild!.id, channel.name, 'supportMsgChannel');
    client.settings.set(message.guild!.id, adminChannel.name, 'adminChannel');
    channel.send(client.embed(client.config.supportMsg)).then(async (msg) => {
        client.settings.set(message.guild!.id, msg?.id, 'supportMsg');
        await msg.react('🔧').catch((e) => {
            client.logger.error(`An error has accured: ${e}`);
            console.error(e);
            return;
        });
        const filter = (reaction: MessageReaction, user: User) =>
            user.id !== client.user!.id;
        const collector = msg.createReactionCollector(filter);
        collector.on('collect', (reaction, user) => {
            if (reaction.emoji.name === '🔧') {
                client.logger.cmd(
                    `${
                        client.config.permLevels.find(
                            (l) =>
                                l.level ===
                                client.functions.permlevel(client, message)
                        )!.name
                    } ${user.username} (${user.id}) ran command support`
                );
                startSupport(client, message.guild!, user, message.settings);
            }
            reaction.users.remove(user).catch((err) => {
                client.logger.error(`An error has accured: ${err}`);
                console.error(err);
            });
        });
    });
};

export const conf = {
    name: 'setup-support',
    permLevel: 'Server Owner',
};

export const help = {
    category: 'Support',
    description: 'Sets up support message',
    usage: 'setup-support <channelName>',
};

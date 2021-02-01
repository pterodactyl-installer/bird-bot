import { MessageReaction, TextChannel, User } from 'discord.js';
import { Message } from '../classes/Message';
import { RunFunction, SetupFunction } from '../interfaces/Command';
import { startSupport } from '../modules/support';

export const setup: SetupFunction = async (client) => {
    setTimeout(() => {
        client.guilds.cache.forEach(async (guild) => {
            let settings = client.functions.getSettings(client, guild);
            if (!settings.supportMsg) return;
            let channel = guild.channels.cache.find(
                (channel) =>
                    channel.name.toLowerCase() === settings.supportMsgChannel
            );
            if (typeof channel === 'undefined') return;
            let msg = await (channel as TextChannel).messages.fetch(
                settings.supportMsg
            );
            if (typeof msg === 'undefined') return;
            await msg.react('🔧').catch((e) => {
                return client.logger(e, 'error');
            });
            const filter = (reaction: MessageReaction, user: User) =>
                user.id !== client.user!.id;
            let collector = msg.createReactionCollector(filter);
            collector.on('collect', (reaction, user) => {
                if (reaction.emoji.name === '🔧') {
                    let message: unknown = {
                        channel: channel,
                        client: client,
                        guild: guild,
                        member: guild.members.cache.find(
                            (m) => m.id === user.id
                        ),
                        settings: settings,
                        author: { id: user.id },
                    };
                    client.logger(
                        `${
                            client.config.permLevels.find(
                                (l) =>
                                    l.level ===
                                    client.functions.permlevel(
                                        client,
                                        message as Message
                                    )
                            )!.name
                        } ${user.username} (${user.id}) ran command support`,
                        'cmd'
                    );
                    startSupport(client, guild, user, settings);
                }
                reaction.users
                    .remove(user)
                    .catch((err) => client.logger(err, 'error'));
            });
        });
    }, 5000);
};

export const run: RunFunction = async (client, message, args, level) => {
    startSupport(client, message.guild!, message.author, message.settings);
};

export const conf = {
    name: 'support',
    permLevel: 'User',
};

export const help = {
    category: 'Support',
    description: 'Get support',
    usage: 'support',
};

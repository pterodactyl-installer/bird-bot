import { MessageReaction, TextChannel, User } from 'discord.js';
import { Message } from '../classes/Message';
import { RunFunction, SetupFunction } from '../interfaces/Command';
import { startSupport } from '../modules/support';

export const setup: SetupFunction = async (client) => {
    setTimeout(() => {
        client.guilds.cache.forEach(async (guild) => {
            const settings = client.functions.getSettings(client, guild);
            if (!settings.supportMsg) return;
            const channel = guild.channels.cache.find(
                (channel) =>
                    channel.name.toLowerCase() === settings.supportMsgChannel
            );
            if (typeof channel === 'undefined') return;
            const msg = await (channel as TextChannel).messages.fetch(
                settings.supportMsg
            );
            if (typeof msg === 'undefined') return;
            await msg.react('🔧').catch((e) => {
                client.logger.error(`An error has accured: ${e}`);
                console.error(e);
                return;
            });
            const filter = (reaction: MessageReaction, user: User) =>
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                user.id !== client.user!.id;
            const collector = msg.createReactionCollector(filter);
            collector.on('collect', (reaction, user) => {
                if (reaction.emoji.name === '🔧') {
                    const message: unknown = {
                        channel: channel,
                        client: client,
                        guild: guild,
                        member: guild.members.cache.find(
                            (m) => m.id === user.id
                        ),
                        settings: settings,
                        author: { id: user.id },
                    };
                    client.logger.cmd(
                        `${
                            client.config.permLevels.find(
                                (l) =>
                                    l.level ===
                                    client.functions.permlevel(
                                        client,
                                        message as Message
                                    )
                            )?.name
                        } ${user.username} (${user.id}) ran command support`
                    );
                    startSupport(client, guild, user, settings);
                }
                reaction.users.remove(user).catch((err) => {
                    client.logger.error(`An error has accured: ${err}`);
                    console.error(err);
                });
            });
        });
    }, 5000);
};

export const run: RunFunction = async (client, message) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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

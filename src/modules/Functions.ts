import { Guild, MessageEmbed, TextChannel } from 'discord.js';
import { Bot } from '../classes/Client';
import { Message } from '../classes/Message';
import { Command } from '../interfaces/Command';
import { ChannelConf } from '../interfaces/CreateChannelConf';
import { Event } from '../interfaces/Event';
import { GuildSettings } from '../interfaces/GuildSettings';

export const defaultSettings: GuildSettings = {
    prefix: '!',
    adminRole: 'administrator',
    supportRole: 'moderator',
    embedColor: '#ff0000',
    supportMsgChannel: '',
    adminChannel: '',
    supportMsg: '',
};

export class Functions {
    /* PERMISSION LEVEL FUNCTION */
    public permlevel(client: Bot, message: Message): number {
        let permlvl = 0;

        const permOrder = client.config.permLevels
            .slice(0)
            .sort((p, c) => (p.level < c.level ? 1 : -1));

        while (permOrder.length) {
            const currentLevel = permOrder.shift();
            if (!currentLevel) continue;
            if (currentLevel.check(message)) {
                permlvl = currentLevel.level;
                break;
            }
        }
        return permlvl;
    }
    /* GUILD SETTINGS FUNCTION */

    // getSettings merges the client defaults with the guild settings. guild settings in
    // enmap should only have *unique* overrides that are different from defaults.
    public getSettings(client: Bot, guild?: Guild): GuildSettings {
        client.settings.ensure('default', defaultSettings);
        if (!guild) return defaultSettings;
        const guildConf = client.settings.get(guild.id) || {};
        return { ...defaultSettings, ...guildConf };
    }
    /* Loading commands */
    public async loadCommand(client: Bot, commandName: string): Promise<void> {
        try {
            client.logger.log(`Loading Command: ${commandName}`);
            const cmd: Command = await import(`../commands/${commandName}`);
            if (cmd.setup) cmd.setup(client);
            client.commands.set(cmd.conf.name, cmd);
        } catch (e) {
            client.logger.error(`Unable to load command ${commandName}`);
            console.error(e);
        }
    }
    public async unloadCommand(
        client: Bot,
        commandName: string
    ): Promise<boolean | string> {
        try {
            client.logger.log(`Unloading Command: ${commandName}`);
            let command;
            if (client.commands.has(commandName)) {
                command = client.commands.get(commandName);
            }
            if (!command)
                return `The command \`${commandName}\` doesn't seem to exist, nor is it an alias. Try again!`;
            const mod =
                require.cache[
                    require.resolve(`../commands/${command.conf.name}`)
                ];
            if (!mod) return `Can't find the module`;
            delete require.cache[
                require.resolve(`../commands/${command.conf.name}.js`)
            ];
            for (let i = 0; i < (mod.parent?.children.length || 0); i++) {
                if (mod.parent?.children[i] === mod) {
                    mod.parent?.children.splice(i, 1);
                    break;
                }
            }
            return false;
        } catch (e) {
            client.logger.error(
                `Unable to unload command ${commandName}: ${e}`
            );
            console.error(e);
            return e;
        }
    }
    /* Loading events */
    public async loadEvent(client: Bot, eventName: string): Promise<void> {
        try {
            client.logger.log(`Loading Event: ${eventName}`);
            const event: Event = await import(`../events/${eventName}`);
            client.on(eventName, event.run.bind(null, client));
        } catch (e) {
            client.logger.error(`Unable to load event ${eventName}`);
            console.error(e);
        }
    }
    /* Permission error handling */
    public permissionError(
        client: Bot,
        message: Message,
        cmd: Command
    ): MessageEmbed {
        return client.embed(
            {
                title: 'You do not have permission to use this command.',
                fields: [
                    {
                        name: '\u200b',
                        value: `**Your permission level is ${message.author.level} (${message.author.levelName})**`,
                    },
                    {
                        name: '\u200b',
                        value: `**This command requires level ${
                            client.levelCache[cmd.conf.permLevel]
                        } (${cmd.conf.permLevel})**`,
                    },
                ],
            },
            message
        );
    }
    /*
    SINGLE-LINE AWAITMESSAGE
    const response = await client.awaitReply(msg, "Favourite Color?");
    msg.reply(`Oh, I really love ${response} too!`);
    */
    public async awaitReply(
        userId: string,
        channel: TextChannel,
        question: string,
        limit = 60000
    ): Promise<string> {
        const filter = (m: Message) => m.author.id === userId;
        await channel.send(question);
        const collected = await channel.awaitMessages(filter, {
            max: 1,
            time: limit,
            errors: ['time'],
        });
        return collected.first()?.content || 'Error';
    }
    public async createTextChannel(
        message: Message,
        channelConf: ChannelConf
    ): Promise<TextChannel | undefined> {
        try {
            let channel = message.guild?.channels.cache.find(
                (channel) =>
                    channel.name.toLowerCase() ===
                    channelConf.name.toLowerCase()
            );
            if (!channel) {
                if (!message.guild.me?.hasPermission('MANAGE_CHANNELS')) {
                    message.reply(
                        `I don't have permissions to create a channel!`
                    );
                    return;
                }
                channel = await message.guild?.channels.create(
                    channelConf.name,
                    {
                        ...channelConf.options,
                        type: 'text',
                    }
                );
            }
            channel?.fetch(true);
            return channel as TextChannel;
        } catch (err) {
            message.client.logger.error(`An error has accured: ${err}`);
            console.error(err);
            return;
        }
    }
}

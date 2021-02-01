import { Guild, TextChannel } from 'discord.js';
import { Message } from '../classes/Message';
import { Bot } from '../client/client';
import { Command } from '../interfaces/Command';
import { ChannelConf } from '../interfaces/CreateChannelConf';
import { GuildSettings } from '../interfaces/GuildSettings';

// THIS IS HERE BECAUSE SOME PEOPLE DELETE ALL THE GUILD SETTINGS
// And then they're stuck because the default settings are also gone.
// So if you do that, you're resetting your defaults. Congrats.

export const defaultSettings: GuildSettings = {
    prefix: '!',
    supportRole: 'moderator',
    embedColor: '#ff0000',
    supportMsgChannel: '',
    adminChannel: '',
    supportMsg: '',
};

export const Functions = {
    /* PERMISSION LEVEL FUNCTION */
    permlevel: (client: Bot, message: Message) => {
        let permlvl = 0;

        const permOrder = client.config.permLevels
            .slice(0)
            .sort((p, c) => (p.level < c.level ? 1 : -1));

        while (permOrder.length) {
            const currentLevel = permOrder.shift()!;
            if (currentLevel.check(message)) {
                permlvl = currentLevel.level;
                break;
            }
        }
        return permlvl;
    },
    /* GUILD SETTINGS FUNCTION */

    // getSettings merges the client defaults with the guild settings. guild settings in
    // enmap should only have *unique* overrides that are different from defaults.
    getSettings: (client: Bot, guild: Guild): GuildSettings => {
        client.settings.ensure('default', defaultSettings);
        if (!guild) return client.settings.get('default')!;
        const guildConf = client.settings.get(guild.id) || {};
        return { ...client.settings.get('default')!, ...guildConf };
    },

    /*
    SINGLE-LINE AWAITMESSAGE
    const response = await client.awaitReply(msg, "Favourite Color?");
    msg.reply(`Oh, I really love ${response} too!`);
    */
    awaitReply: async (
        userId: string,
        channel: TextChannel,
        question: string,
        limit = 60000
    ) => {
        const filter = (m: Message) => m.author.id === userId;
        await channel.send(question);
        const collected = await channel.awaitMessages(filter, {
            max: 1,
            time: limit,
            errors: ['time'],
        });
        return collected.first()!.content;
    },
    /*
    MESSAGE CLEAN FUNCTION
    "Clean" removes @everyone pings, as well as tokens, and makes code blocks
    escaped so they're shown more easily. As a bonus it resolves promises
    and stringifies objects!
    This is mostly only used by the Eval and Exec commands.
    */
    clean: async (client: Bot, text: any) => {
        if (text && text.constructor.name == 'Promise') text = await text;
        if (typeof text !== 'string')
            text = require('util').inspect(text, { depth: 1 });

        text = text
            .replace(/`/g, '`' + String.fromCharCode(8203))
            .replace(/@/g, '@' + String.fromCharCode(8203))
            .replace(
                client.token,
                'mfa.VkO_2G4Qv3T--NO--lWetW_tjND--TOKEN--QFTm6YGtzq9PH--4U--tG0'
            );

        return text;
    },

    loadCommand: async (
        client: Bot,
        commandName: string
    ): Promise<boolean | string> => {
        try {
            client.logger(`Loading Command: ${commandName.split('.')[0]}`);
            const props: Command = await import(`../commands/${commandName}`);
            client.commands.set(props.conf.name, props);
            if (props.setup) props.setup(client);
            return false;
        } catch (e) {
            client.logger(
                `Unable to load command ${commandName}: ${e}`,
                'error'
            );
            return e;
        }
    },

    unloadCommand: async (
        client: Bot,
        commandName: string
    ): Promise<boolean | string> => {
        try {
            client.logger(`Unloading Command: ${commandName}`);
            let command;
            command = client.commands.get(commandName);
            if (!command)
                return `The command \`${commandName}\` doesn"t seem to exist. Try again!`;
            const mod =
                require.cache[
                    require.resolve(`../commands/${command.conf.name}`)
                ];
            delete require.cache[
                require.resolve(`../commands/${command.conf.name}.js`)
            ];
            for (let i = 0; i < mod!.parent!.children.length; i++) {
                if (mod!.parent!.children[i] === mod) {
                    mod.parent!.children.splice(i, 1);
                    break;
                }
            }
            return false;
        } catch (e) {
            client.logger(
                `Unable to unload command ${commandName}: ${e}`,
                'error'
            );
            return e;
        }
    },
    removeRoute: (stack: any, path: string): void => {
        function removeRoute(route: any, i: number, routes: any) {
            switch (route.path) {
                case path:
                    routes.splice(i, 1);
            }
            if (route.route) route.route.stack.forEach(removeRoute);
        }
        stack.forEach(removeRoute);
    },
    createTextChannel: async (
        message: Message,
        channelConf: ChannelConf
    ): Promise<TextChannel | undefined> => {
        try {
            let channel = message.guild?.channels.cache.find(
                (channel) =>
                    channel.name.toLowerCase() ===
                    channelConf.name.toLowerCase()
            );
            if (!channel) {
                if (!message.guild!.me!.hasPermission('MANAGE_CHANNELS')) {
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
            message.client.logger(err, 'error');
            return;
        }
    },
};

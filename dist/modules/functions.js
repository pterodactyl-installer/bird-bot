"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Functions = exports.defaultSettings = void 0;
exports.defaultSettings = {
    prefix: '!',
    supportRole: 'moderator',
    embedColor: '#ff0000',
    supportMsgChannel: '',
    adminChannel: '',
    supportMsg: '',
};
exports.Functions = {
    permlevel: (client, message) => {
        let permlvl = 0;
        const permOrder = client.config.permLevels
            .slice(0)
            .sort((p, c) => (p.level < c.level ? 1 : -1));
        while (permOrder.length) {
            const currentLevel = permOrder.shift();
            if (currentLevel.check(message)) {
                permlvl = currentLevel.level;
                break;
            }
        }
        return permlvl;
    },
    getSettings: (client, guild) => {
        client.settings.ensure('default', exports.defaultSettings);
        if (!guild)
            return client.settings.get('default');
        const guildConf = client.settings.get(guild.id) || {};
        return Object.assign(Object.assign({}, client.settings.get('default')), guildConf);
    },
    awaitReply: async (userId, channel, question, limit = 60000) => {
        const filter = (m) => m.author.id === userId;
        await channel.send(question);
        const collected = await channel.awaitMessages(filter, {
            max: 1,
            time: limit,
            errors: ['time'],
        });
        return collected.first().content;
    },
    clean: async (client, text) => {
        if (text && text.constructor.name == 'Promise')
            text = await text;
        if (typeof text !== 'string')
            text = require('util').inspect(text, { depth: 1 });
        text = text
            .replace(/`/g, '`' + String.fromCharCode(8203))
            .replace(/@/g, '@' + String.fromCharCode(8203))
            .replace(client.token, 'mfa.VkO_2G4Qv3T--NO--lWetW_tjND--TOKEN--QFTm6YGtzq9PH--4U--tG0');
        return text;
    },
    loadCommand: async (client, commandName) => {
        try {
            client.logger(`Loading Command: ${commandName.split('.')[0]}`);
            const props = await Promise.resolve().then(() => __importStar(require(`../commands/${commandName}`)));
            client.commands.set(props.conf.name, props);
            if (props.setup)
                props.setup(client);
            return false;
        }
        catch (e) {
            client.logger(`Unable to load command ${commandName}: ${e}`, 'error');
            return e;
        }
    },
    unloadCommand: async (client, commandName) => {
        try {
            client.logger(`Unloading Command: ${commandName}`);
            let command;
            command = client.commands.get(commandName);
            if (!command)
                return `The command \`${commandName}\` doesn"t seem to exist. Try again!`;
            const mod = require.cache[require.resolve(`../commands/${command.conf.name}`)];
            delete require.cache[require.resolve(`../commands/${command.conf.name}.js`)];
            for (let i = 0; i < mod.parent.children.length; i++) {
                if (mod.parent.children[i] === mod) {
                    mod.parent.children.splice(i, 1);
                    break;
                }
            }
            return false;
        }
        catch (e) {
            client.logger(`Unable to unload command ${commandName}: ${e}`, 'error');
            return e;
        }
    },
    createTextChannel: async (message, channelConf) => {
        var _a, _b;
        try {
            let channel = (_a = message.guild) === null || _a === void 0 ? void 0 : _a.channels.cache.find((channel) => channel.name.toLowerCase() ===
                channelConf.name.toLowerCase());
            if (!channel) {
                if (!message.guild.me.hasPermission('MANAGE_CHANNELS')) {
                    message.reply(`I don't have permissions to create a channel!`);
                    return;
                }
                channel = await ((_b = message.guild) === null || _b === void 0 ? void 0 : _b.channels.create(channelConf.name, Object.assign(Object.assign({}, channelConf.options), { type: 'text' })));
            }
            channel === null || channel === void 0 ? void 0 : channel.fetch(true);
            return channel;
        }
        catch (err) {
            message.client.logger(err, 'error');
            return;
        }
    },
};

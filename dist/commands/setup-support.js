"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.help = exports.conf = exports.run = void 0;
const support_1 = require("../modules/support");
const run = async (client, message, args, level) => {
    var _a;
    if (args.length < 2)
        return message.reply('Must provide 2 channel names! (support) (admin)');
    let channel = await client.functions.createTextChannel(message, {
        name: args[0],
        options: { topic: 'Support', reason: 'Support' },
    });
    let adminChannel = await client.functions.createTextChannel(message, {
        name: args[1],
        options: {
            topic: 'Support admin',
            reason: 'Support admin',
            permissionOverwrites: [
                { id: message.guild.roles.everyone, deny: ['VIEW_CHANNEL'] },
                {
                    id: client.user.id,
                    allow: ['MANAGE_CHANNELS', 'VIEW_CHANNEL'],
                },
                {
                    id: (_a = message.guild) === null || _a === void 0 ? void 0 : _a.roles.cache.find((r) => r.name === message.settings.supportRole),
                    allow: ['VIEW_CHANNEL'],
                },
            ],
        },
    });
    if (typeof channel === 'undefined')
        return;
    if (typeof adminChannel === 'undefined')
        return;
    client.settings.set(message.guild.id, channel.name, 'supportMsgChannel');
    client.settings.set(message.guild.id, adminChannel.name, 'adminChannel');
    channel.send(client.embed(client.config.supportMsg)).then(async (msg) => {
        client.settings.set(message.guild.id, msg === null || msg === void 0 ? void 0 : msg.id, 'supportMsg');
        await msg.react('🔧').catch((e) => {
            return client.logger(e, 'error');
        });
        const filter = (reaction, user) => user.id !== client.user.id;
        let collector = msg.createReactionCollector(filter);
        collector.on('collect', (reaction, user) => {
            if (reaction.emoji.name === '🔧') {
                client.logger(`${client.config.permLevels.find((l) => l.level ===
                    client.functions.permlevel(client, message)).name} ${user.username} (${user.id}) ran command support`, 'cmd');
                support_1.startSupport(client, message.guild, user, message.settings);
            }
            reaction.users
                .remove(user)
                .catch((err) => client.logger(err, 'error'));
        });
    });
};
exports.run = run;
exports.conf = {
    name: 'setup-support',
    permLevel: 'Server Owner',
};
exports.help = {
    category: 'Support',
    description: 'Sets up support message',
    usage: 'setup-support <channelName>',
};

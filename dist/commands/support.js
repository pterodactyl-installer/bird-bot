"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.help = exports.conf = exports.run = exports.setup = void 0;
const support_1 = require("../modules/support");
const setup = async (client) => {
    setTimeout(() => {
        client.guilds.cache.forEach(async (guild) => {
            let settings = client.functions.getSettings(client, guild);
            if (!settings.supportMsg)
                return;
            let channel = guild.channels.cache.find((channel) => channel.name.toLowerCase() === settings.supportMsgChannel);
            if (typeof channel === 'undefined')
                return;
            let msg = await channel.messages.fetch(settings.supportMsg);
            if (typeof msg === 'undefined')
                return;
            await msg.react('🔧').catch((e) => {
                return client.logger(e, 'error');
            });
            const filter = (reaction, user) => user.id !== client.user.id;
            let collector = msg.createReactionCollector(filter);
            collector.on('collect', (reaction, user) => {
                if (reaction.emoji.name === '🔧') {
                    let message = {
                        channel: channel,
                        client: client,
                        guild: guild,
                        member: guild.members.cache.find((m) => m.id === user.id),
                        settings: settings,
                        author: { id: user.id },
                    };
                    client.logger(`${client.config.permLevels.find((l) => l.level ===
                        client.functions.permlevel(client, message)).name} ${user.username} (${user.id}) ran command support`, 'cmd');
                    support_1.startSupport(client, guild, user, settings);
                }
                reaction.users
                    .remove(user)
                    .catch((err) => client.logger(err, 'error'));
            });
        });
    }, 5000);
};
exports.setup = setup;
const run = async (client, message, args, level) => {
    support_1.startSupport(client, message.guild, message.author, message.settings);
};
exports.run = run;
exports.conf = {
    name: 'support',
    permLevel: 'User',
};
exports.help = {
    category: 'Support',
    description: 'Get support',
    usage: 'support',
};

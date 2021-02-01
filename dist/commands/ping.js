"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.help = exports.conf = exports.run = void 0;
const run = async (client, message, args, level) => {
    const embed = client.embed({
        title: '**🏓 PING!**',
        color: message.settings.embedColor,
        fields: [
            {
                name: 'BOT Latency',
                value: `**${Date.now() - message.createdTimestamp}ms**`,
            },
            {
                name: 'Discord API Latency',
                value: `**${Math.round(client.ws.ping)}ms**`,
            },
        ],
        timestamp: new Date(),
    });
    message.channel.send(embed);
};
exports.run = run;
exports.conf = {
    name: 'ping',
    permLevel: 'User',
};
exports.help = {
    name: 'ping',
    category: 'Miscelaneous',
    description: 'Bot latency',
    usage: 'ping',
};

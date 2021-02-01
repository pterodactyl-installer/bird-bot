"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.help = exports.conf = exports.run = void 0;
const run = async (client, message) => {
    await message.reply('Bot is shutting down.');
    await Promise.all(client.commands.map((cmd) => client.functions.unloadCommand(client, cmd.conf.name)));
    process.exit(0);
};
exports.run = run;
exports.conf = {
    name: 'reboot',
    permLevel: 'Bot Owner',
};
exports.help = {
    category: 'System',
    description: 'Shuts down the bot and starts again if running under server manager.',
    usage: 'reboot',
};

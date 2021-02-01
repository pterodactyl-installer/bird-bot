"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = exports.name = void 0;
exports.name = 'message';
const run = async (client, message) => {
    if (message.author.bot || !message.guild)
        return;
    const settings = (message.settings = client.functions.getSettings(client, message.guild));
    const prefixMention = new RegExp(`^<@!?${client.user.id}>( |)$`);
    if (message.content.match(prefixMention))
        return message.reply(`My prefix is \`${settings.prefix}\``);
    if (message.content.indexOf(settings.prefix) !== 0)
        return;
    const args = message.content
        .slice(settings.prefix.length)
        .trim()
        .split(/ +/g);
    const command = args.shift().toLowerCase();
    if (message.guild && !message.member)
        await message.guild.members.fetch(message.author);
    const level = client.functions.permlevel(client, message);
    const cmd = client.commands.get(command);
    if (!cmd)
        return;
    if (level < client.levelCache[cmd.conf.permLevel]) {
        return message.channel
            .send(`You do not have permission to use this command.
  Your permission level is ${level} (${client.config.permLevels.find((l) => l.level === level).name})
  This command requires level ${client.levelCache[cmd.conf.permLevel]} (${cmd.conf.permLevel})`);
    }
    client.logger(`${client.config.permLevels.find((l) => l.level === level).name} ${message.author.username} (${message.author.id}) ran command ${cmd.conf.name}`, 'cmd');
    cmd.run(client, message, args, level);
};
exports.run = run;

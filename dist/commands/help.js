"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.help = exports.conf = exports.run = void 0;
const run = async (client, message, args, level) => {
    if (!args[0]) {
        const myCommands = client.commands.filter((cmd) => client.levelCache[cmd.conf.permLevel] <= level);
        let currentCategory = '';
        let fields = [];
        let fieldsNum = 0;
        const sorted = myCommands
            .array()
            .sort((p, c) => p.help.category > c.help.category
            ? 1
            : p.conf.name > c.conf.name &&
                p.help.category === c.help.category
                ? 1
                : -1);
        sorted.forEach((c) => {
            const cat = c.help.category;
            if (currentCategory !== cat) {
                if (currentCategory !== '')
                    fieldsNum += 1;
                fields[fieldsNum] = { name: `${cat}`, value: '' };
                currentCategory = cat;
            }
            fields[fieldsNum].value += `${message.settings.prefix}${c.conf.name} - ${c.help.description}\n`;
        });
        message.channel.send(client.embed({
            title: 'Command list',
            color: message.settings.embedColor,
            description: `**Use ${message.settings.prefix}help <commandname> for details**`,
            fields: fields,
            timestamp: new Date(),
        }));
    }
    else {
        let cmd = args[0];
        if (client.commands.has(cmd)) {
            let command = client.commands.get(cmd);
            if (level < client.levelCache[command.conf.permLevel])
                return;
            message.channel.send(client.embed({
                title: 'Command list',
                color: message.settings.embedColor,
                fields: [
                    {
                        name: 'Description:',
                        value: command.help.description,
                    },
                    { name: 'Usage:', value: command.help.usage },
                ],
                timestamp: new Date(),
            }));
        }
    }
};
exports.run = run;
exports.conf = {
    name: 'help',
    permLevel: 'User',
};
exports.help = {
    category: 'System',
    description: 'Displays all the available commands for your permission level.',
    usage: 'help [command]',
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.help = exports.conf = exports.run = void 0;
const run = async (client, message, args) => {
    const code = args.join(' ');
    try {
        const evaled = eval(code);
        const clean = await client.functions.clean(client, evaled);
        message.channel.send(`\`\`\`js\n${clean}\n\`\`\``);
    }
    catch (err) {
        message.channel.send(`\`ERROR\` \`\`\`xl\n${await client.functions.clean(client, err)}\n\`\`\``);
    }
};
exports.run = run;
exports.conf = {
    name: 'eval',
    permLevel: 'Bot Owner',
};
exports.help = {
    category: 'System',
    description: 'Evaluates arbitrary javascript.',
    usage: 'eval [...code]',
};

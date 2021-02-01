import { RunFunction } from '../interfaces/Command';
export const run: RunFunction = async (client, message, args) => {
    const code = args.join(' ');
    try {
        const evaled = eval(code);
        const clean = await client.functions.clean(client, evaled);
        message.channel.send(`\`\`\`js\n${clean}\n\`\`\``);
    } catch (err) {
        message.channel.send(
            `\`ERROR\` \`\`\`xl\n${await client.functions.clean(
                client,
                err
            )}\n\`\`\``
        );
    }
};

export const conf = {
    name: 'eval',
    permLevel: 'Bot Owner',
};

export const help = {
    category: 'System',
    description: 'Evaluates arbitrary javascript.',
    usage: 'eval [...code]',
};

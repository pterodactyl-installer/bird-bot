import fs from 'fs';
import { CategoryChannel, Guild, TextChannel, User } from 'discord.js';
import { Bot } from '../client/client';
import { handleData } from './handleData';
import { Body } from '../interfaces/TroubleshootBody';
import { GuildSettings } from '../interfaces/GuildSettings';
const script = fs.readFileSync(
    `${__dirname}/../../scripts/troubleshooting.sh`,
    'utf8'
);

export const apiStart = (
    client: Bot,
    channel: TextChannel,
    adminChannel: TextChannel,
    category: CategoryChannel,
    guild: Guild,
    user: User,
    settings: GuildSettings
) => {
    let link = `/${require('shortid').generate()}`;
    let timeout = setTimeout(() => {
        channel.fetch(true);
        if (!channel.deleted) {
            client.functions.removeRoute(client.express._router.stack, link);
            channel.delete('Exceeded time!');
            category.fetch(true);
            if (!category.deleted) category.delete('Exceeded time!');
        }
    }, 600000);
    channel.send(
        user.toString(),
        client.embed({
            title: 'Welcome to support!',
            description:
                'To start with run this command in your terminal:\n```bash\nbash <(curl -s ' +
                client.config.expressFQDN +
                `:${client.config.expressAliasPort}` +
                link +
                ')```',
        })
    );
    client.express.get(link, (req, res) => {
        res.set('Content-Type', 'text/html');
        res.send(
            script.replace(
                'LINK',
                `${client.config.expressFQDN}:${
                    client.config.expressAliasPort + link
                }`
            )
        );
    });
    client.express.post(link, async (req, res) => {
        try {
            if (!req.body.os) {
                res.status(422).send({
                    code: 422,
                    description: `Data can't be proccesed`,
                    success: false,
                });
                throw 'Invalid data received! Stopping this support instance!';
            } else {
                res.status(200).send({
                    code: 200,
                    description: 'Data received',
                    success: true,
                });
            }
            client.functions.removeRoute(client.express._router.stack, link);
            let reply = await handleData(client, req.body as Body, settings);
            if (!channel.deleted) channel.send(reply.user);
            adminChannel.send(user.toString(), reply.admin);
            clearTimeout(timeout);
            let rez = await client.functions
                .awaitReply(user.id, channel, 'Continue? (y/N):', 180000)
                .catch(() => {
                    return 'y';
                });
            if (rez === 'y') {
                channel.delete('End of support');
                category.delete('End of support');
            }
        } catch (error) {
            client.logger(error, 'error');
            if (guild.channels.cache.some((c) => c.name === user.username)) {
                let channel = guild.channels.cache.find(
                    (c) => c.parent?.name === user.username
                );
                clearTimeout(timeout);
                channel?.fetch(true);
                if (channel) {
                    if (!channel?.deleted) channel?.delete('Error');
                    if (!channel?.parent?.deleted)
                        channel?.parent?.delete('Error');
                }
            }
        }
    });
};

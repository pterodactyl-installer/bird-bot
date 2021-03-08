import validUrl from 'valid-url';
import fetch from 'node-fetch';
import { Bot } from '../classes/Client';
import { MessageEmbed } from 'discord.js';
import { checkLog } from './checkLogs';
import { GuildSettings } from '../interfaces/GuildSettings';
import { Body } from '../interfaces/TroubleshootBody';

export const handleBody = async (
    client: Bot,
    body: Body,
    settings: GuildSettings
): Promise<MessageEmbed> => {
    const embed = client.embed({
        title: 'Logs:',
        description: 'The script has got these logs:',
        fields: [
            { name: 'OS', value: `${body.os} ${body.os_ver}`, inline: false },
            { name: 'Panel Logs:', value: body.panel_log, inline: true },
            { name: 'Wings Logs:', value: body.wings_log, inline: true },
            { name: 'Nginx Logs:', value: body.nginx_check, inline: true },
        ],
        color: settings.embedColor,
    });
    const fetchLogs = async (url: string): Promise<string> => {
        try {
            const rawData = await fetch(url, {
                method: 'GET',
                headers: {
                    responseEncoding: 'utf8',
                    Accept: 'text/html',
                },
            });
            if (rawData.ok) {
                return rawData.text();
            } else {
                return 'Empty';
            }
        } catch (err) {
            client.logger.error(`There has been an error: ${err}`);
            console.error(err);
            return 'Empty';
        }
    };
    const handleLog = async (url: string): Promise<string> => {
        if (validUrl.isUri(url)) {
            return await fetchLogs(url);
        } else return 'Empty';
    };
    embed.addFields(await checkLog(await handleLog(body.panel_log), 'panel'));
    embed.addFields(await checkLog(await handleLog(body.wings_log), 'wings'));
    embed.addFields(await checkLog(await handleLog(body.nginx_check), 'nginx'));

    return embed;
};

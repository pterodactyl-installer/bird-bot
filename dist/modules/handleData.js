"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleData = void 0;
const valid_url_1 = __importDefault(require("valid-url"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const checkLogs_1 = require("./checkLogs");
const handleData = async (client, body, settings) => {
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
    const fetchLogs = async (url) => {
        try {
            const rawData = await node_fetch_1.default(url, {
                method: 'GET',
                headers: {
                    responseEncoding: 'utf8',
                    Accept: 'text/html',
                },
            });
            if (rawData.ok) {
                return rawData.text();
            }
            else {
                return 'Empty';
            }
        }
        catch (err) {
            client.logger(err, 'error');
            return 'Empty';
        }
    };
    const handleLog = async (url) => {
        if (valid_url_1.default.isUri(url)) {
            return await fetchLogs(url);
        }
        else
            return 'Empty';
    };
    embed.addFields(await checkLogs_1.checkLog(await handleLog(body.panel_log), 'panel'));
    embed.addFields(await checkLogs_1.checkLog(await handleLog(body.wings_log), 'wings'));
    embed.addFields(await checkLogs_1.checkLog(await handleLog(body.nginx_check), 'nginx'));
    return { user: embed, admin: embed };
};
exports.handleData = handleData;

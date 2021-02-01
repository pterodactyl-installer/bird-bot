"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSupport = void 0;
const api_1 = require("./api");
const startSupport = async (client, guild, user, settings) => {
    var _a, _b;
    try {
        if (!guild.me.hasPermission('MANAGE_CHANNELS'))
            return client.logger(`Bot doesn't have permissions to create a channel!`, 'error');
        if (guild.channels.cache.some((c) => c.name === user.username))
            return;
        let category = await guild.channels.create(user.username, {
            type: 'category',
            permissionOverwrites: [
                { id: guild.roles.everyone, deny: ['VIEW_CHANNEL'] },
                { id: user, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'] },
                {
                    id: client.user.id,
                    allow: ['MANAGE_CHANNELS', 'VIEW_CHANNEL'],
                },
            ],
            reason: `Support for ${user.tag}`,
        });
        let channel = await guild.channels.create('support', {
            type: 'text',
            topic: `Support for ${user.username}`,
            parent: category,
            reason: `Support for ${user.tag}`,
        });
        let adminChannel = guild.channels.cache.find((c) => c.name.toLowerCase() === settings.adminChannel);
        api_1.apiStart(client, channel, adminChannel, category, guild, user, settings);
    }
    catch (error) {
        client.logger(error, 'error');
        if (guild.channels.cache.some((c) => c.name === user.username)) {
            let channel = guild.channels.cache.find((c) => { var _a; return ((_a = c.parent) === null || _a === void 0 ? void 0 : _a.name) === user.username; });
            channel === null || channel === void 0 ? void 0 : channel.fetch(true);
            if (!(channel === null || channel === void 0 ? void 0 : channel.deleted))
                channel === null || channel === void 0 ? void 0 : channel.delete('Error');
            if (!((_a = channel === null || channel === void 0 ? void 0 : channel.parent) === null || _a === void 0 ? void 0 : _a.deleted))
                (_b = channel === null || channel === void 0 ? void 0 : channel.parent) === null || _b === void 0 ? void 0 : _b.delete('Error');
        }
    }
};
exports.startSupport = startSupport;

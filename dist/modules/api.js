"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiStart = void 0;
const fs_1 = __importDefault(require("fs"));
const handleData_1 = require("./handleData");
const script = fs_1.default.readFileSync(`${__dirname}/../../scripts/troubleshooting.sh`, 'utf8');
const apiStart = (client, channel, adminChannel, category, guild, user, settings) => {
    let link = `/${require('shortid').generate()}`;
    let timeout = setTimeout(() => {
        channel.fetch(true);
        if (!channel.deleted) {
            client.functions.removeRoute(client.express._router.stack, link);
            channel.delete('Exceeded time!');
            category.fetch(true);
            if (!category.deleted)
                category.delete('Exceeded time!');
        }
    }, 600000);
    channel.send(user.toString(), client.embed({
        title: 'Welcome to support!',
        description: 'To start with run this command in your terminal:\n```bash\nbash <(curl -s ' +
            client.config.expressFQDN +
            `:${client.config.expressAliasPort}` +
            link +
            ')```',
    }));
    client.express.get(link, (req, res) => {
        res.set('Content-Type', 'text/html');
        res.send(script.replace('LINK', `${client.config.expressFQDN}:${client.config.expressAliasPort + link}`));
    });
    client.express.post(link, async (req, res) => {
        var _a, _b;
        try {
            if (!req.body.os) {
                res.status(422).send({
                    code: 422,
                    description: `Data can't be proccesed`,
                    success: false,
                });
                throw 'Invalid data received! Stopping this support instance!';
            }
            else {
                res.status(200).send({
                    code: 200,
                    description: 'Data received',
                    success: true,
                });
            }
            client.functions.removeRoute(client.express._router.stack, link);
            let reply = await handleData_1.handleData(client, req.body, settings);
            if (!channel.deleted)
                channel.send(reply.user);
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
        }
        catch (error) {
            client.logger(error, 'error');
            if (guild.channels.cache.some((c) => c.name === user.username)) {
                let channel = guild.channels.cache.find((c) => { var _a; return ((_a = c.parent) === null || _a === void 0 ? void 0 : _a.name) === user.username; });
                clearTimeout(timeout);
                channel === null || channel === void 0 ? void 0 : channel.fetch(true);
                if (channel) {
                    if (!(channel === null || channel === void 0 ? void 0 : channel.deleted))
                        channel === null || channel === void 0 ? void 0 : channel.delete('Error');
                    if (!((_a = channel === null || channel === void 0 ? void 0 : channel.parent) === null || _a === void 0 ? void 0 : _a.deleted))
                        (_b = channel === null || channel === void 0 ? void 0 : channel.parent) === null || _b === void 0 ? void 0 : _b.delete('Error');
                }
            }
        }
    });
};
exports.apiStart = apiStart;

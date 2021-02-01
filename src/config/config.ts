import { Config } from '../interfaces/Config';
import { Bot } from '../client/client';

export const config: Config = {
    // Bot Owner, level 10 by default. A User ID. (Linux123123)
    ownerID: '244024524289343489',

    // Your Bot's Token. Available on https://discord.com/developers/applications/me
    token: 'TOKEN',

    // Express internal server port
    expressPort: 5000,

    // Express alias port (external port) can be nothing, when localy the same as expressPort
    expressAliasPort: 5000,

    // Express FQDN (external) for user to use to connect
    expressFQDN: 'http://api.api.com',

    // Support Message
    supportMsg: {
        title: 'Support!',
        description: 'React with 🔧 to get **Support**!!!',
    },

    // PERMISSION LEVEL DEFINITIONS.
    permLevels: [
        // This is the lowest permisison level, this is for non-roled users.
        {
            level: 0,
            name: 'User',
            // Don't bother checking, just return true which allows them to execute any command their
            // level allows them to.
            check: () => true,
        },

        // This is your permission level, the staff levels should always be above the rest of the roles.
        {
            level: 2,
            name: 'Support',
            check: (message) => {
                try {
                    const modRole = message.guild!.roles.cache.find(
                        (r) =>
                            r.name.toLowerCase() ===
                            message.settings.modRole.toLowerCase()
                    );
                    if (modRole && message.member!.roles.cache.has(modRole.id))
                        return true;
                } catch (e) {
                    return false;
                }
            },
        },
        // This is the server owner.
        {
            level: 4,
            name: 'Server Owner',
            // Simple check, if the guild owner id matches the message author's ID, then it will return true.
            // Otherwise it will return false.
            check: (message) =>
                message.channel.type === 'text'
                    ? message.guild!.ownerID === message.author.id
                        ? true
                        : false
                    : false,
        },
        {
            level: 10,
            name: 'Bot Owner',
            // Another simple check, compares the message author id to the one stored in the config file.
            check: (message) =>
                (message.client as Bot).config.ownerID === message.author.id,
        },
    ],
};

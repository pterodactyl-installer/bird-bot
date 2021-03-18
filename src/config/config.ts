import { Message } from "../classes/Message";
import { Bot } from "../classes/Client";
import { Config } from "../interfaces/Config";
import { config as dotenv } from "dotenv";

dotenv();

export const config: Config = {
  // Bot Creator, level 10 by default. A User ID. (Linux123123)
  ownerID: "244024524289343489",

  // Your Bot's Token. Available on https://discord.com/developers/applications/me
  token: process.env.TOKEN ? process.env.TOKEN : "TOKEN",

  // Express internal server port
  expressPort: process.env.PORT ? process.env.PORT : "PORT",

  // Express FQDN (external) for user to use to connect (can include :port)
  expressFQDN: process.env.FQDN ? process.env.FQDN : "FQDN",

  // An FQDN to netcat based pastebin server instance
  binFQDN: process.env.binFQDN ? process.env.binFQDN : "binFQDN",

  // The port on which that the server is hosted
  binPORT: process.env.binPORT ? process.env.binPORT : "binPORT",

  // Support Message
  supportMsg: {
    title: "Support!",
    description: "React with 🔧 to get **Support**!!!",
  },

  // PERMISSION LEVEL DEFINITIONS.
  permLevels: [
    {
      level: 0,
      name: "User",
      check: () => true,
    },
    {
      level: 2,
      name: "Moderator",
      check: (message: Message): boolean => {
        try {
          const modRole = message.guild?.roles.cache.find(
            (r) =>
              r.name.toLowerCase() ===
              message.settings.supportRole.toLowerCase()
          );
          if (modRole && message.member?.roles.cache.has(modRole.id))
            return true;
          return false;
        } catch (e) {
          return false;
        }
      },
    },
    {
      level: 4,
      name: "Server Owner",
      check: (message) =>
        message.guild?.ownerID === message.author.id ? true : false,
    },
    {
      level: 10,
      name: "Bot Creator",
      check: (message) =>
        (message.client as Bot).config.ownerID === message.author.id,
    },
  ],
};

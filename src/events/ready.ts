import { RunFunction } from "../interfaces/Event";
import { defaultSettings } from "../modules/Functions";
export const run: RunFunction = (client) => {
  client.logger.ready(
    `${client.user?.tag}, ready to serve ${client.users.cache.size} users in ${client.guilds.cache.size} servers.`
  );
  client.user?.setActivity(`${defaultSettings.prefix}help`, {
    type: "PLAYING",
  });
};

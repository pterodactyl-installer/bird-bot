import { ReactionEmoji, TextChannel } from "discord.js";
import { User } from "../classes/User";
import { RunFunction } from "../interfaces/Event";
import { defaultSettings } from "../modules/Functions";
export const run: RunFunction = (client) => {
  client.logger.ready(
    `${client.user?.tag}, ready to serve ${client.users.cache.size} users in ${client.guilds.cache.size} servers.`
  );
  client.user?.setActivity(`${defaultSettings.prefix}help`, {
    type: "PLAYING",
  });
  client.apiData.forEach(async (data) => {
    const channel = (await client.channels.fetch(data.channel)) as TextChannel;
    if (channel.deletable) channel.delete();
    if (channel.parent?.deletable) channel.parent.delete();
  });
  client.apiData.deleteAll();
  client.commands.forEach((cmd) => {
    if (cmd.setup) cmd.setup(client);
  });
  client.reactionCollectors.forEach(async (data, msgId) => {
    const channel = (await client.channels.fetch(
      data.adminChannel
    )) as TextChannel;
    const supportChannel = (await client.channels.fetch(
      data.supportChannel
    )) as TextChannel;
    const msg = await channel.messages.fetch(msgId);
    const filter = (reaction: ReactionEmoji, user: User) =>
      user.id !== client.user?.id;
    msg
      .createReactionCollector(filter)
      .on("collect", async (reaction, user) => {
        if (reaction.emoji.name === "❌") {
          await reaction.remove();
          await supportChannel.updateOverwrite(data.user, {
            VIEW_CHANNEL: null,
            SEND_MESSAGES: null,
          });
        } else await reaction.users.remove(user);
      });
  });
  client.reactionCollectors.deleteAll();
  client.activeSupport.forEach(async (c) => {
    const channel = (await client.channels.fetch(c)) as TextChannel;
    if (channel.deletable) channel.delete();
    if (channel.parent?.deletable) channel.parent.delete();
  });
  client.activeSupport.deleteAll();
};

import { MessageReaction, TextChannel, User } from "discord.js";
import { Message } from "../classes/Message";
import { RunFunction, SetupFunction } from "../interfaces/Command";
import { startSupport } from "../modules/support";

export const setup: SetupFunction = async (client) => {
  try {
    client.guilds.cache.forEach(async (guild) => {
      const settings = client.functions.getSettings(client, guild);
      if (!settings.supportMsg) return;
      const channel = (await client.channels.fetch(
        settings.supportMsgChannel
      )) as TextChannel;
      if (!channel)
        return client.logger.error("Failed to find support channel!");
      const msg = await channel.messages.fetch(settings.supportMsg);
      if (!msg) return client.logger.error("Failed to find support msg!");
      await msg.react("🔧");
      const filter = (reaction: MessageReaction, user: User) =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        user.id !== client.user!.id;
      const collector = msg.createReactionCollector(filter);
      collector.on("collect", async (reaction, user) => {
        if (reaction.emoji.name === "🔧") {
          const message = {
            channel: channel,
            client: client,
            guild: guild,
            member: await guild.members.fetch(user),
            settings: settings,
            author: { id: user.id },
          };
          client.logger.cmd(
            `${
              client.config.permLevels.find(
                (l) =>
                  l.level ===
                  client.functions.permlevel(client, message as Message)
              )?.name
            } ${user.username} (${user.id}) ran command support`
          );
          startSupport(client, guild, user, settings);
        }
        reaction.users.remove(user);
      });
    });
  } catch (e) {
    client.logger.error(`An error has accured: ${e}`);
    console.error(e);
    return;
  }
};

export const run: RunFunction = async (client, message) => {
  startSupport(client, message.guild, message.author, message.settings);
};

export const conf = {
  name: "support",
  permLevel: "User",
};

export const help = {
  category: "Support",
  description: "Get support",
  usage: "support",
};

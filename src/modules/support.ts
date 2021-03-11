import { Guild, User } from "discord.js";
import { Bot } from "../classes/Client";
import { GuildSettings } from "../interfaces/GuildSettings";

export const startSupport = async (
  client: Bot,
  guild: Guild,
  user: User,
  settings: GuildSettings
): Promise<void> => {
  try {
    if (!guild.me?.hasPermission("MANAGE_CHANNELS")) {
      client.logger.error(`Bot doesn't have permissions to create a channel!`);
      return;
    }
    if (guild.channels.cache.some((c) => c.name === user.username)) return;
    const category = await guild.channels.create(user.username, {
      type: "category",
      permissionOverwrites: [
        { id: guild.roles.everyone, deny: ["VIEW_CHANNEL"] },
        { id: user, allow: ["VIEW_CHANNEL", "SEND_MESSAGES"] },
        {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          id: client.user!.id,
          allow: ["MANAGE_CHANNELS", "VIEW_CHANNEL"],
        },
      ],
      reason: `Support for ${user.tag}`,
    });
    const channel = await guild.channels.create("support", {
      type: "text",
      topic: `Support for ${user.username}`,
      parent: category,
      reason: `Support for ${user.tag}`,
    });
    const adminChannel = guild.channels.cache.find(
      (c) => c.name.toLowerCase() === settings.adminChannel
    );
    if (!adminChannel) throw new Error(`Can't find the admin channel!`);
    const id = (await import("shortid")).generate();
    channel.send(
      user.toString(),
      client.embed({
        title: "Welcome to support!",
        description: `**You have 10 minutes**\nTo start with run this command in your terminal:\n\`\`\`bash\nbash <(curl -s ${client.config.expressFQDN}/script/${id})\`\`\``,
        color: settings.embedColor,
        timestamp: new Date(),
      })
    );
    setTimeout(() => {
      client.apiData.delete(id);
      if (!channel.deleted) channel.delete("Exceeded time!");
      if (!category.deleted) category.delete("Exceeded time!");
    }, 600000);
    client.apiData.set(id, {
      channel: channel.id,
      adminChannel: adminChannel.id,
      guild: guild.id,
      user: user,
      settings: settings,
    });
  } catch (error) {
    client.logger.error(`There has been an error: ${error}`);
    console.error(error);
    const channel = guild.channels.cache.find(
      (c) => c.parent?.name === user.username
    );
    if (channel) {
      channel.delete("Error");
      channel.parent?.delete("Error");
    }
  }
};

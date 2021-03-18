import {
  Guild,
  MessageAttachment,
  MessageEmbed,
  Role,
  TextChannel,
} from "discord.js";
import { createWorker } from "tesseract.js";
import { Bot } from "../classes/Client";
import { Message } from "../classes/Message";
import { Command } from "../interfaces/Command";
import { ChannelConf } from "../interfaces/CreateChannelConf";
import { RoleConf } from "../interfaces/CreateGuildRoleConf";
import { Event } from "../interfaces/Event";
import { GuildSettings } from "../interfaces/GuildSettings";

export const defaultSettings: GuildSettings = {
  prefix: "!",
  supportRole: "",
  embedColor: "#0000FF",
  supportMsgChannel: "",
  supportMsg: "",
  logsChannel: "",
  supportChannel: "",
};

export class Functions {
  /* PERMISSION LEVEL FUNCTION */
  public permlevel(client: Bot, message: Message): number {
    let permlvl = 0;

    const permOrder = client.config.permLevels
      .slice(0)
      .sort((p, c) => (p.level < c.level ? 1 : -1));

    while (permOrder.length) {
      const currentLevel = permOrder.shift();
      if (!currentLevel) continue;
      if (currentLevel.check(message)) {
        permlvl = currentLevel.level;
        break;
      }
    }
    return permlvl;
  }
  /* GUILD SETTINGS FUNCTION */

  // getSettings merges the client defaults with the guild settings. guild settings in
  // enmap should only have *unique* overrides that are different from defaults.
  public getSettings(client: Bot, guild?: Guild): GuildSettings {
    client.settings.ensure("default", defaultSettings);
    if (!guild) return defaultSettings;
    const guildConf = client.settings.get(guild.id) || {};
    return { ...defaultSettings, ...guildConf };
  }
  /* Loading triggers */
  public async loadTrigger(client: Bot, commandName: string): Promise<void> {
    try {
      client.logger.log(`Loading Trigger: ${commandName}`);
      const cmd: Command = await import(`../commands/${commandName}`);
      client.commands.set(cmd.conf.name, cmd);
    } catch (e) {
      client.logger.error(`Unable to load Trigger ${commandName}`);
      console.error(e);
    }
  }
  /* Loading events */
  public async loadEvent(client: Bot, eventName: string): Promise<void> {
    try {
      client.logger.log(`Loading Event: ${eventName}`);
      const event: Event = await import(`../events/${eventName}`);
      client.on(eventName, event.run.bind(null, client));
    } catch (e) {
      client.logger.error(`Unable to load event ${eventName}`);
      console.error(e);
    }
  }
  /* Permission error handling */
  public permissionError(
    client: Bot,
    message: Message,
    cmd: Command
  ): MessageEmbed {
    return client.embed(
      {
        title: "You do not have permission to use this command.",
        fields: [
          {
            name: "\u200b",
            value: `**Your permission level is ${message.author.level} (${message.author.levelName})**`,
          },
          {
            name: "\u200b",
            value: `**This command requires level ${
              client.levelCache[cmd.conf.permLevel]
            } (${cmd.conf.permLevel})**`,
          },
        ],
      },
      message
    );
  }
  /*
  SINGLE-LINE AWAITREPLY
  */
  public async awaitReply(
    userId: string,
    channel: TextChannel,
    question?: string | MessageEmbed,
    limit = 9999999
  ): Promise<string> {
    const filter = (m: Message) => m.author.id === userId;
    if (question) await channel.send(question);
    const collected = await channel.awaitMessages(filter, {
      max: 1,
      time: limit,
      errors: ["time"],
    });
    return collected.first()?.content || "Empty";
  }
  /*
  SINGLE-LINE AWAITMESSAGE
  */
  public async awaitMessage(
    userId: string,
    channel: TextChannel,
    question?: string,
    limit = 9999999
  ): Promise<Message> {
    const filter = (m: Message) => m.author.id === userId;
    if (question) await channel.send(question);
    const collected = await channel.awaitMessages(filter, {
      max: 1,
      time: limit,
      errors: ["time"],
    });
    return collected.first() as Message;
  }
  public async createTextChannel(
    message: Message,
    channelConf: ChannelConf
  ): Promise<TextChannel | undefined> {
    try {
      if (!message.guild.me?.hasPermission("MANAGE_CHANNELS")) {
        message.reply(`I don't have permissions to create a channel!`);
        throw new Error(`I don't have permissions to create a channel!`);
      }
      let channel = message.guild.channels.cache.find(
        (channel) =>
          channel.name.toLowerCase() === channelConf.name.toLowerCase()
      );
      if (!channel) {
        channel = await message.guild.channels.create(channelConf.name, {
          ...channelConf.options,
          type: "text",
        });
      }
      if (!channel) throw new Error("Error creating the channel!");
      return channel as TextChannel;
    } catch (err) {
      message.client.logger.error(`An error has accured: ${err}`);
      console.error(err);
      return;
    }
  }
  public async createGuilRole(
    message: Message,
    roleConf: RoleConf
  ): Promise<Role | undefined> {
    try {
      let role = message.guild.roles.cache.find(
        (r) => r.name.toLowerCase() === roleConf.name.toLowerCase()
      );
      if (!role) {
        if (!message.guild.me?.hasPermission("MANAGE_ROLES")) {
          message.reply(`I don't have permissions to manages roles!`);
          throw new Error("Bot doesn't have permissions to manage roles!");
        }
        role = await message.guild.roles.create({
          data: { ...roleConf.options, name: roleConf.name },
        });
      }
      if (!role) throw new Error("Error creating the role");
      return role;
    } catch (err) {
      message.client.logger.error(`An error has accured: ${err}`);
      console.error(err);
      return;
    }
  }
  /*
    PARSE-IMAGE
    Pareses an image and gives back text
    */
  public async parseImage(item: MessageAttachment): Promise<string> {
    const worker = createWorker({
      langPath: `${__dirname}/../../eng.traineddata`,
    });
    await worker.load();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    const {
      data: { text },
    } = await worker.recognize(item.url);
    await worker.terminate();
    return text;
  }
}

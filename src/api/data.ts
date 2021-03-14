import { Bot } from "../classes/Client";
import { Request, Response } from "express";
import { MessageReaction, ReactionEmoji, TextChannel } from "discord.js";
import { fetchLogs, handleBody } from "../modules/handleReqBody";
import { checkLog } from "../modules/checkLogs";
import { validationResult } from "express-validator";
import { User } from "../classes/User";

export const handleData = async (
  client: Bot,
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const apiData = client.apiData.get(req.params.id);
    if (!apiData) {
      res.status(404).send('echo "Not found"');
      return;
    }
    client.apiData.delete(req.params.id);
    const channel = (await client.channels.fetch(
      apiData.channel
    )) as TextChannel;
    const adminChannel = (await client.channels.fetch(
      apiData.settings.adminChannel
    )) as TextChannel;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      client.logger.warn(
        `Invalid data received! Stopping ${apiData.user.username} support instance!`
      );
      res.status(400).json({
        code: 400,
        description: `Data can't be proccesed`,
        errros: errors.array(),
        success: false,
      });
      const msg = await channel.send(
        client.embed({
          title: "Bad data received",
          description:
            "Bad **POST** request was received. Stopping this support!",
          color: apiData.settings.embedColor,
          timestamp: new Date(),
        })
      );
      await msg.delete({ timeout: 30000 });
      await channel.parent?.delete("Bad request body");
      await channel.delete("Bad request body");
      return;
    } else {
      res.status(200).json({
        code: 200,
        description: "Data received",
        success: true,
      });
      const embed = await handleBody(client, req.body, apiData.settings);
      await channel.send(embed);
      const adminMsg = await adminChannel.send(apiData.user.toString(), embed);
      if (embed.fields.length < 5) {
        const rez = await client.functions.awaitReply(
          apiData.user.id,
          channel,
          "No erros where found. Do you want to provide your own error/question? (y/N):"
        );
        if (rez.toLowerCase() === "y") {
          const msg = await client.functions.awaitMessage(
            apiData.user.id,
            channel,
            "Paste your logs / logfile / screenshot"
          );
          let text = "";
          if (msg.attachments.size > 0) {
            const photoExtensions = ["png", "jpeg", "jpg"];
            await Promise.all(
              msg.attachments.map(async (item) => {
                let photo = false;
                photoExtensions.forEach((ext) => {
                  if (item.url.endsWith(ext)) {
                    photo = true;
                  }
                });
                if (photo) {
                  text += await client.functions.parseImage(item);
                } else {
                  text += await fetchLogs(client, item.url);
                }
              })
            );
          } else {
            text = msg.content;
          }
          const errors = checkLog(client, text);
          if (errors.length > 0) {
            await channel.send(
              client.embed(
                { title: "Errors", fields: errors },
                undefined,
                apiData.settings.embedColor
              )
            );
          } else {
            await channel.send("No errors where found in the log provided!");
            const rez = await client.functions.awaitReply(
              apiData.user.id,
              channel,
              "Do you want to talk to a real human? (y/N):"
            );
            if (rez.toLowerCase() === "y") {
              await channel.send("You will be sent to the support channel!");
              const supportChannel = (await client.channels.fetch(
                apiData.settings.supportChannel
              )) as TextChannel;
              if (!supportChannel) return;
              await supportChannel.updateOverwrite(apiData.user, {
                VIEW_CHANNEL: true,
                SEND_MESSAGES: true,
              });
              await adminMsg.react("❌");
              const filter = (reaction: ReactionEmoji, user: User) =>
                user.id !== client.user?.id;
              const collector = adminMsg.createReactionCollector(filter);
              const reactionCollect = async (
                reaction: MessageReaction,
                user: User
              ) => {
                if (reaction.emoji.name === "❌") {
                  await reaction.remove();
                  await supportChannel.updateOverwrite(apiData.user.id, {
                    VIEW_CHANNEL: null,
                    SEND_MESSAGES: null,
                  });
                  client.reactionCollectors.delete(adminMsg.id);
                } else await reaction.users.remove(user);
              };
              collector.on("collect", reactionCollect);
              client.reactionCollectors.set(adminMsg.id, {
                supportChannel: supportChannel.id,
                adminChannel: adminChannel.id,
                user: apiData.user.id,
              });
              await supportChannel.send(
                apiData.user.toString(),
                client.embed({
                  title: `${apiData.user.username} error`,
                  description: text.length > 2048 ? text.slice(0, 2048) : text,
                })
              );
            }
          }
        }
      }
      const delMsg = await channel.send(
        "End of support! the channel will be deleted after 10 minutes passes from the start or you react with ❌"
      );
      await delMsg.react("❌");
      const filter = (reaction: ReactionEmoji, user: User) =>
        user.id !== client.user?.id;
      const collector = delMsg.createReactionCollector(filter);
      collector.on("collect", async (reaction, user) => {
        if (reaction.emoji.name === "❌") {
          await reaction.users.remove(user);
          await channel.delete("End of support");
          await channel.parent?.delete("End of support");
        } else await reaction.users.remove(user);
      });
    }
  } catch (e) {
    client.logger.error(`An error has accured: ${e}`);
    console.error(e);
    return;
  }
};

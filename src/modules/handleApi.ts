import { TextChannel } from "discord.js";
import { Request, Response } from "express";
import { Bot } from "../classes/Client";
import { handleBody } from "./handleReqBody";

export const handleScript = (
  client: Bot,
  req: Request,
  res: Response
): void => {
  const apiData = client.apiData.get(req.params.id);
  if (!apiData) {
    res.status(404).send('echo "Not found"');
    return;
  }
  const script = client.script.replace(
    "LINK",
    `${client.config.expressFQDN + `/data/${req.params.id}`}`
  );
  res.status(200).send(script);
};

export const handleData = async (
  client: Bot,
  req: Request,
  res: Response
): Promise<void> => {
  const apiData = client.apiData.get(req.params.id);
  if (!apiData) {
    res.status(404).send('echo "Not found"');
    return;
  }
  client.apiData.delete(req.params.id);
  const guild = client.guilds.cache.find((g) => g.id === apiData.guild);
  const channel = guild?.channels.cache.find(
    (c) => c.id === apiData.channel
  ) as TextChannel;
  const adminChannel = guild?.channels.cache.find(
    (c) => c.id === apiData.adminChannel
  ) as TextChannel;
  if (!req.body) {
    res.status(422).send({
      code: 422,
      description: `Data can't be proccesed`,
      success: false,
    });
    channel.send(
      client.embed({
        title: "Bad data received",
        description:
          "Bad **POST** request was received. Stopping this support!",
        color: apiData.settings.embedColor,
        timestamp: new Date(),
      })
    );
    channel.parent?.delete("Bad request body");
    channel.delete("Bad request body");
    client.logger.warn(
      `Invalid data received! Stopping ${apiData.user.toString()} support instance!`
    );
    return;
  } else {
    res.status(200).send({
      code: 200,
      description: "Data received",
      success: true,
    });
    const reply = await handleBody(client, req.body, apiData.settings);
    channel.send(reply);
    adminChannel.send(apiData.user.toString(), reply);
    const rez = await client.functions
      .awaitReply(apiData.user.id, channel, "Continue? (y/N):", 999999)
      .catch();
    if (rez === "y") {
      channel.delete("End of support");
      channel.parent?.delete("End of support");
    }
  }
};

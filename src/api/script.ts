import { Request, Response } from "express";
import { Bot } from "../classes/Client";

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

import enmap from "enmap";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { urlencoded, json } from "body-parser";
import { readdir, readFile } from "fs";
import { Client, MessageEmbed, MessageEmbedOptions, Intents } from "discord.js";
import { Command } from "../interfaces/Command";
import { Config, permObject } from "../interfaces/Config";
import { Logger } from "../modules/Logger";
import { defaultSettings, Functions } from "../modules/Functions";
import { GuildSettings } from "../interfaces/GuildSettings";
import { ApiData } from "../interfaces/ApiData";
import { handleScript } from "../api/script";
import { handleData } from "../api/data";
import { promisify } from "util";
import { handleExceptions } from "../modules/handleExceptions";
import { Message } from "./Message";
import { ReaColl } from "../interfaces/ReaColl";

const readAsyncDir = promisify(readdir);
const readAsyncFile = promisify(readFile);

export class Bot extends Client {
  public constructor(public readonly config: Config) {
    super({ ws: { intents: Intents.NON_PRIVILEGED } });
  }
  public commands: enmap<string, Command> = new enmap();
  public settings: enmap<string, GuildSettings> = new enmap("settings");
  public apiData: enmap<string, ApiData> = new enmap("apiData");
  public reactionCollectors: enmap<string, ReaColl> = new enmap("reactCollect");
  public activeSupport: enmap<string, string> = new enmap("activeSupport");
  public levelCache: { [key: string]: number } = {};
  public script!: string;
  public functions = new Functions();
  public logger = new Logger();
  public express = express();
  public async start(): Promise<void> {
    const config = this.config;
    handleExceptions(this);
    this.login(config.token);
    this.express.listen(parseInt(config.expressPort), () => {
      this.logger.ready(`API server started on ${config.expressFQDN}`);
    });
    this.express.use(urlencoded({ extended: false }));
    this.express.use(json());
    this.express.get("/script/:id", (req, res) => {
      handleScript(this, req, res);
    });
    this.express.post(
      "/data/:id",
      body("os").isString().isLength({ min: 1 }),
      body("os_ver").isString().isLength({ min: 1 }),
      body("panel_log").isString().isLength({ min: 1 }),
      body("wings_log").isString().isLength({ min: 1 }),
      body("nginx_check").isString().isLength({ min: 1 }),
      (req: Request, res: Response) => {
        handleData(this, req, res);
      }
    );
    const triggersFiles = await readAsyncDir(`${__dirname}/../commands`);
    const eventFiles = await readAsyncDir(`${__dirname}/../events`);
    triggersFiles.forEach((cmd) =>
      this.functions.loadTrigger(this, cmd.split(".")[0])
    );
    eventFiles.forEach((event) =>
      this.functions.loadEvent(this, event.split(".")[0])
    );
    for (let i = 0; i < this.config.permLevels.length; i++) {
      const thisLevel: permObject = this.config.permLevels[i];
      this.levelCache[thisLevel.name] = thisLevel.level;
    }
    this.script = await readAsyncFile(
      `${__dirname}/../../scripts/troubleshooting.sh`,
      { encoding: "utf-8" }
    ).then((script) => {
      return script.replace(
        "NC_URL_PORT",
        `"${this.config.binFQDN} ${this.config.binPORT}"`
      );
    });
  }
  public embed(
    data: MessageEmbedOptions,
    message?: Message,
    embedColor = defaultSettings.embedColor
  ): MessageEmbed {
    return new MessageEmbed({
      ...data,
      color: message ? message.settings.embedColor : embedColor,
      timestamp: new Date(),
    });
  }
}

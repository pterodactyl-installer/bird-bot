import express from "express";
import { urlencoded, json } from "body-parser";
import enmap from "enmap";
import { readdir, readFile } from "fs";
import { Client, MessageEmbed, MessageEmbedOptions, Intents } from "discord.js";
import { Command } from "../interfaces/Command";
import { Config, permObject } from "../interfaces/Config";
import { Logger } from "../modules/Logger";
import { Functions } from "../modules/Functions";
import { GuildSettings } from "../interfaces/GuildSettings";
import { ApiData } from "../interfaces/ApiData";
import { handleScript, handleData } from "../modules/handleApi";
import { promisify } from "util";
import { handleExceptions } from "../modules/handleExceptions";
import { Message } from "./Message";

const readAsyncDir = promisify(readdir);
const readAsyncFile = promisify(readFile);

export class Bot extends Client {
  public constructor(public readonly config: Config) {
    super({ ws: { intents: Intents.NON_PRIVILEGED } });
  }
  public commands: enmap<string, Command> = new enmap();
  public settings: enmap<string, GuildSettings> = new enmap("settings");
  public apiData: enmap<string, ApiData> = new enmap();
  public levelCache: { [key: string]: number } = {};
  public script!: string;
  public functions = new Functions();
  public logger = new Logger();
  public express = express();
  public async start(): Promise<void> {
    const config = this.config;
    handleExceptions(this);
    this.login(config.token);
    this.express.listen(config.expressPort, () => {
      this.logger.ready(
        `API server started on ${config.expressFQDN}:${config.expressPort}`
      );
    });
    this.express.use(urlencoded({ extended: false }));
    this.express.use(json());
    this.express.get("/script/:id", (req, res) => {
      handleScript(this, req, res);
    });
    this.express.post("/data/:id", (req, res) => {
      handleData(this, req, res);
    });
    const cmdFiles = await readAsyncDir(`${__dirname}/../commands`);
    const eventFiles = await readAsyncDir(`${__dirname}/../events`);
    cmdFiles.forEach((cmd) =>
      this.functions.loadCommand(this, cmd.split(".")[0])
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
    );
  }
  public embed(
    data: MessageEmbedOptions,
    message?: Message,
    embedColor = "#0000FF"
  ): MessageEmbed {
    return new MessageEmbed({
      ...data,
      color: message ? message.settings.embedColor : embedColor,
      timestamp: new Date(),
    });
  }
}

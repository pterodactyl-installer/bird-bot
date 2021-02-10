import express from 'express';
import fs from 'fs';
import enmap from 'enmap';
import bodyParser from 'body-parser';
import { Client, MessageEmbed, MessageEmbedOptions, Intents } from 'discord.js';
import { Command } from '../interfaces/Command';
import { Event } from '../interfaces/Event';
import { Config, permObject } from '../interfaces/Config';
import { Logger } from '../modules/logger';
import { Functions } from '../modules/functions';
import { GuildSettings } from '../interfaces/GuildSettings';
import { ApiData } from '../interfaces/ApiData';
import { handleScript, handleData } from '../modules/handleApi';

class Bot extends Client {
    public constructor() {
        super({ ws: { intents: Intents.NON_PRIVILEGED } });
    }
    public commands: enmap<string, Command> = new enmap();
    public settings: enmap<string, GuildSettings> = new enmap('settings');
    public apiData: enmap<string, ApiData> = new enmap();
    public levelCache: any = {};
    public script!: string;
    public logger = Logger;
    public functions = Functions;
    public express = express();
    public config!: Config;
    public async start(config: Config): Promise<void> {
        this.config = config;
        this.login(config.token);
        this.express.listen(config.expressPort, () => {
            this.logger(
                `API server started on ${config.expressFQDN}:${config.expressPort}`,
                'ready'
            );
        });
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use(bodyParser.json());
        this.express.get('/script/:id', (req, res) => {
            handleScript(this, req, res);
        });
        this.express.post('/data/:id', (req, res) => {
            handleData(this, req, res);
        });
        const commandFiles = fs
            .readdirSync('./dist/commands')
            .filter((file) => file.endsWith('.js'));
        const eventFiles = fs
            .readdirSync('./dist/events')
            .filter((file) => file.endsWith('.js'));
        commandFiles.map(async (commandFile: string) => {
            this.functions.loadCommand(this, commandFile);
        });
        eventFiles.map(async (eventFile: string) => {
            const ev = (await import(`../events/${eventFile}`)) as Event;
            this.logger(`Loading Event: ${ev.name}`);
            this.on(ev.name, ev.run.bind(null, this));
        });
        for (let i = 0; i < this.config.permLevels.length; i++) {
            const thisLevel: permObject = this.config.permLevels[i];
            this.levelCache[thisLevel.name] = thisLevel.level;
        }
        fs.readFile(
            `${__dirname}/../../scripts/troubleshooting.sh`,
            'utf8',
            (err, script) => {
                if (err)
                    return this.logger(
                        `Failed loading the script: ${err}`,
                        'error'
                    );
                this.script = script;
            }
        );
    }
    public embed(data: MessageEmbedOptions): MessageEmbed {
        return new MessageEmbed({
            ...data,
        });
    }
}

export { Bot };

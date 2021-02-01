"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bot = void 0;
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const enmap_1 = __importDefault(require("enmap"));
const body_parser_1 = __importDefault(require("body-parser"));
const discord_js_1 = require("discord.js");
const logger_1 = require("../modules/logger");
const functions_1 = require("../modules/functions");
class Bot extends discord_js_1.Client {
    constructor() {
        super({ ws: { intents: discord_js_1.Intents.NON_PRIVILEGED } });
        this.commands = new enmap_1.default();
        this.settings = new enmap_1.default('settings');
        this.levelCache = {};
        this.logger = logger_1.Logger;
        this.functions = functions_1.Functions;
        this.express = express_1.default();
    }
    async start(config) {
        this.config = config;
        this.login(config.token);
        this.express.listen(config.expressPort, () => {
            this.logger(`API server started on ${config.expressFQDN}:${config.expressPort}`, 'ready');
        });
        this.express.use(body_parser_1.default.urlencoded({ extended: false }));
        this.express.use(body_parser_1.default.json());
        const commandFiles = fs_1.default
            .readdirSync('./dist/commands')
            .filter((file) => file.endsWith('.js'));
        const eventFiles = fs_1.default
            .readdirSync('./dist/events')
            .filter((file) => file.endsWith('.js'));
        commandFiles.map(async (commandFile) => {
            this.functions.loadCommand(this, commandFile);
        });
        eventFiles.map(async (eventFile) => {
            const ev = (await Promise.resolve().then(() => __importStar(require(`../events/${eventFile}`))));
            this.logger(`Loading Event: ${ev.name}`);
            this.on(ev.name, ev.run.bind(null, this));
        });
        for (let i = 0; i < this.config.permLevels.length; i++) {
            const thisLevel = this.config.permLevels[i];
            this.levelCache[thisLevel.name] = thisLevel.level;
        }
    }
    embed(data) {
        return new discord_js_1.MessageEmbed(Object.assign({}, data));
    }
}
exports.Bot = Bot;

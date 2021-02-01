import { MessageEmbedOptions } from 'discord.js';
import { Message } from '../classes/Message';

export interface permCheck {
    (message: Message): boolean | undefined;
}

export interface permObject {
    level: number;
    name: string;
    check: permCheck;
}

export interface Config {
    ownerID: string;
    token: string;
    expressPort: number;
    expressAliasPort: number;
    expressFQDN: string;
    supportMsg: MessageEmbedOptions;
    permLevels: permObject[];
}

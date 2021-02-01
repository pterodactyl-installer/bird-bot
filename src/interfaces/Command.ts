import { Message } from '../classes/Message';
import { Bot } from '../client/client';

export interface SetupFunction {
    (client: Bot): Promise<unknown>;
}

export interface RunFunction {
    (
        client: Bot,
        message: Message,
        args: string[],
        level: number
    ): Promise<unknown>;
}
export interface confObject {
    name: string;
    permLevel: string;
}
export interface helpObject {
    category: string;
    description: string;
    usage: string;
}

export interface Command {
    setup?: SetupFunction;
    run: RunFunction;
    conf: confObject;
    help: helpObject;
}

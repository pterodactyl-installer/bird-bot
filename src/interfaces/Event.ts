import { Bot } from '../client/client';
import { EventEmitter } from 'events';
export interface RunFunction {
    (client: Bot, ...params: any[]): any;
}
export interface Event {
    name: string;
    run: RunFunction;
    emitter?: EventEmitter;
}

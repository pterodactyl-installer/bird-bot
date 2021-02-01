import { RunFunction } from '../interfaces/Event';
export const name: string = 'warn';
export const run: RunFunction = async (client, info: unknown) => {
    client.logger(`${JSON.stringify(info)}`, 'warn');
};

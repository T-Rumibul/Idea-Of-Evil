import { IOEClient } from '@bot/core/IOEClient';

import dotenv from 'dotenv';
import { LogManager } from 'src/utils/Logger';

dotenv.config();
const logManager = new LogManager();
export const client: IOEClient = new IOEClient(logManager);
const token = !process.env.dev ? process.env.TOKEN : process.env.DEVTOKEN;

export function run() {
	client.login(token);
}
client.on('ready', () => {
	client.log('Client is ready!');
});
export default client;

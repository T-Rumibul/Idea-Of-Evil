import { IOEClient } from '@bot/core/IOEClient';

import dotenv from 'dotenv';

dotenv.config();
export const client: IOEClient = new IOEClient();
const token = !process.env.dev ? process.env.TOKEN : process.env.DEVTOKEN;


export function run() {

		client.login(token);

}
client.on('ready', () => {
	client.log("Client is ready!")
})
export default client;


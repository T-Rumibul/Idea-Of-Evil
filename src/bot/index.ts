import { IOEClient } from '@bot/core/IOEClient';

import dotenv from 'dotenv';

dotenv.config();
export const client: IOEClient = new IOEClient();


export function run() {
	if (!process.env.dev) {
		console.log('PROD TOKEN')
		client.login(process.env.TOKEN);
	} else {
		console.log('DEV TOKEN')
		client.login(process.env.DEVTOKEN)
		
	}
}

export default client;


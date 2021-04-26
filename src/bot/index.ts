import { IOEClient } from '@bot/core/IOEClient';

import { Guild, GuildMember, Message } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();
export const client: IOEClient = new IOEClient();

client.on('ready', async () => {
	client.log('Bot is Ready!');
});

export function run() {
	client.login(process.env.TOKEN);
}

export default client;

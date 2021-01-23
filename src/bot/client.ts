import { IOEClient } from '@bot/core/IOEClient';
import MessageEvent from '@bot/events/Message';
import GuildMemberAddEvent from '@bot/events/GuildMemberAdd';
import { Guild, GuildMember, Message } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();
export const client: IOEClient = new IOEClient();

client.login(process.env.TOKEN);

client.on('ready', async () => {
	client.log('Bot is Ready!');
});

client.on('message', async (Message: Message) => {
	MessageEvent(Message, client);
});
client.on('guildMemberAdd', async (Member: GuildMember) => {
	GuildMemberAddEvent(Member, client);
});
export default client;

import { GuildMember } from 'discord.js';
import { CustomArgs } from '@bot/modules/Commands';
export const ownerOnly = true;
export const exec = async (caller: GuildMember, args: string[], { Message, Client }: CustomArgs) => {
	await Client.syncDB();
	const msg = await Message.channel.send('Изменения записаны в базу данных.');
	Client.utils.deleteMessageTimeout(msg, 5000)
};

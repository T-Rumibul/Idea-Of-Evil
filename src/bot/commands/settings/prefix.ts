import { GuildMember } from 'discord.js';
import { CustomArgs } from '@bot/modules/Commands';
export const builder = ['set'];
export const exec = async (caller: GuildMember, args: string[], { Message, Client }: CustomArgs) => {
	console.log('prefix')
	Client.utils.deleteMessageTimeout(Message, 10)
	const msg = await Message.channel.send(`Мой префикс: ${await Client.getPrefix(Message.guild.id)}`);
	Client.utils.deleteMessageTimeout(msg, 10000)
};

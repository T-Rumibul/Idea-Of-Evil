import { ChannelType, GuildMember } from 'discord.js';
import { CustomArgs } from '@bot/modules/Commands';
export const adminOnly = true;
export const exec = async (caller: GuildMember, args: string[], { Message, Client }: CustomArgs) => {
	if (!args[0]) return;
	// For type safety
	if (Message.channel.type !== ChannelType.GuildText) return;
	await Client.setPrefix(Message.guild.id, args[0]);
	const msg = await Message.channel.send(`Новый префикс: ${await Client.getPrefix(Message.guild.id)}`);
	Client.utils.deleteMessageTimeout(msg, 10000)
};

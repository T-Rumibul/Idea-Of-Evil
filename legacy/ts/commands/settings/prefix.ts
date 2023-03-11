import { ChannelType, GuildMember } from 'discord.js';
import { CustomArgs } from '@bot/modules/Commands';
export const builder = ['set'];
export const exec = async (caller: GuildMember, args: string[], { Message, Client }: CustomArgs) => {
	// For type safety
	if (Message.channel.type !== ChannelType.GuildText) return;
	const msg = await Message.channel.send(`Мой префикс: ${await Client.getPrefix(Message.guild.id)}`);
	Client.utils.deleteMessageTimeout(msg, 10000)
};

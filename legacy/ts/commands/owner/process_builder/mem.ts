import { ChannelType, GuildMember } from 'discord.js';
import { CustomArgs } from '@bot/modules/Commands';
export const builder = ['mem'];
export const adminOnly = true;
export const exec = async (caller: GuildMember, args: string[], { Message, Client }: CustomArgs) => {
	// For type safety
	if (Message.channel.type !== ChannelType.GuildText) return;
	
	await Message.channel.send(
		`Используемая память: ${Math.floor(
			process.memoryUsage().heapTotal / Math.pow(1024, 2)
		)} **MB**`
	);
};

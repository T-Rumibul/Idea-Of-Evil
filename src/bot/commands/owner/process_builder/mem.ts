import { GuildMember } from 'discord.js';
import { args as Args } from 'discord-cmd-parser';
import { CustomArgs } from '@bot/modules/Commands';
export const builder = ['mem'];
export const adminOnly = true;
export const exec = async (caller: GuildMember, args: Args, { Message, Client }: CustomArgs) => {
	await Message.channel.send(
		`Используемая память: ${Math.floor(
			process.memoryUsage().heapTotal / Math.pow(1024, 2)
		)} **MB**`
	);
};

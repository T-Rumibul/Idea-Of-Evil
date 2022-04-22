import { GuildMember } from 'discord.js';
import { CustomArgs } from '@bot/modules/Commands';
export const exec = async (caller: GuildMember, args: string[], { Message, Client }: CustomArgs) => {
	const message = await Message.channel.send(`Pong!`);

	message.edit(`Pong! **${message.createdTimestamp - Message.createdTimestamp}**ms`);
};

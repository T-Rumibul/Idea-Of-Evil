import { GuildMember } from 'discord.js';
import { args as Args } from 'discord-cmd-parser';
import { CustomArgs } from '@bot/modules/Commands';
export const exec = async (caller: GuildMember, args: Args, { Message }: CustomArgs) => {
	const message = await Message.channel.send(`Pong!`);
	message.edit(`Pong! **${message.createdTimestamp - Message.createdTimestamp}**ms`);
};

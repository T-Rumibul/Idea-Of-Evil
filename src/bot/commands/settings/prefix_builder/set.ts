import { GuildMember } from 'discord.js';
import { CustomArgs } from '@bot/modules/Commands';

export const exec = async (caller: GuildMember, args: string[], { Message, Client }: CustomArgs) => {
	if (!args[0]) return;
	await Client.setPrefix(Message.guild.id, args[0]);
	await Message.channel.send(`Новый префикс: ${await Client.getPrefix(Message.guild.id)}`);
};

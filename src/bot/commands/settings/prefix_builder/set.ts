import { GuildMember } from 'discord.js';
import { args as Args } from 'discord-cmd-parser';
import { CustomArgs } from '@bot/modules/Commands';

export const exec = async (caller: GuildMember, args: Args, { Message, Client }: CustomArgs) => {
	if (!args._[0]) return;
	await Client.setPrefix(args._[0]);
	await Message.channel.send(`Новый префикс: ${await Client.getPrefix()}`);
};

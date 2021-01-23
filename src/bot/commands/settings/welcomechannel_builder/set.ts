import { GuildMember } from 'discord.js';
import { args as Args } from 'discord-cmd-parser';
import { CustomArgs } from '@bot/modules/Commands';

export const exec = async (caller: GuildMember, args: Args, { Message, Client }: CustomArgs) => {
	if (!args._[0]) return;
	const channel = await Client.utils.getChannelFromMentions(args._[0], caller.guild);
	await Client.setWelcomeChannel(channel.id);
	await Message.channel.send(
		`Новый канал для приветствий: <#${await Client.getWelcomeChannel()}>`
	);
};

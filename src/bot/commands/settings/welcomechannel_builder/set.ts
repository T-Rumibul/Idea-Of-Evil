import { GuildMember } from 'discord.js';
import { CustomArgs } from '@bot/modules/Commands';

export const exec = async (caller: GuildMember, args: string[], { Message, Client }: CustomArgs) => {
	if (!args[0]) return;
	const channel = await Client.utils.getChannelFromMentions(args[0], caller.guild);
	await Client.setWelcomeChannel(Message.guildId, channel.id);
	await Message.channel.send(
		`Новый канал для приветствий: <#${await Client.getWelcomeChannel(Message.guildId)}>`
	);
};

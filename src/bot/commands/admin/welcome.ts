import { GuildMember } from 'discord.js';

import { CustomArgs } from '@bot/modules/Commands';
export const aliases = ['wc']
export const adminOnly = true;
export const exec = async (caller: GuildMember, args: string[], { Message, Client }: CustomArgs) => {
	if (Message.channel.type != "GUILD_TEXT") return
	const member = await Client.utils.getMemberFromMentions(args[0], Message.guild);
	await Client.modules.Welcomer.sendWelcomeMesssage(member, Message.channel);
};

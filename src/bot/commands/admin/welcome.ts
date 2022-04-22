import { GuildMember, Sticker, TextChannel } from 'discord.js';

import { CustomArgs } from '@bot/modules/Commands';
export const adminOnly = true;
export const exec = async (caller: GuildMember, args: string[], { Message, Client }: CustomArgs) => {
	const member = await Client.utils.getMemberFromMentions(args[0], Message.guild);
	await Client.modules.Welcomer.sendWelcomeMesssage(member, Message.channel);
};

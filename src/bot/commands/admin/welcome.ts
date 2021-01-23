import { GuildMember, TextChannel } from 'discord.js';
import { args as Args } from 'discord-cmd-parser';
import { CustomArgs } from '@bot/modules/Commands';
export const adminOnly = true;
export const exec = async (caller: GuildMember, args: Args, { Message, Client }: CustomArgs) => {
	const member = await Client.utils.getMemberFromMentions(args._[0], Message.guild);
	await Client.modules.Welcomer.sendWelcomeMesssage(member, Message.channel);
};

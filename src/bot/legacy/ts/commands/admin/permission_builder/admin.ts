import { ChannelType, GuildMember, TextChannel } from 'discord.js';
import { CustomArgs } from '@bot/modules/Commands';
export const adminOnly = true;
export const exec = async (caller: GuildMember, args: string[], { Message, Client }: CustomArgs) => {
	// For type safety
	if (Message.channel.type !== ChannelType.GuildText) return;
	const member = await Client.utils.getMemberFromMentions(args[0], Message.guild);
	if (!member) return;
	let msg
	if (Client.utils.isAdmin(member)) {
		msg = await Message.channel.send(`У ${member.user.username} есть права администратора.`);
	} else {
		msg = await Message.channel.send(`У ${member.user.username} нет прав администратора.`);
	}
	Client.utils.deleteMessageTimeout(msg, 10000)
};

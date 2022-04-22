import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { CustomArgs } from '@bot/modules/Commands';
export const adminOnly = true;
export const exec = async (caller: GuildMember, args: string[], { Message, Client }: CustomArgs) => {
	Client.log('WTF');
	const member = await Client.utils.getMemberFromMentions(args[0], Message.guild);
	if (Client.utils.isAdmin(member)) {
		await Message.channel.send(`У ${member.user.username} есть права администратора.`);
	} else {
		await Message.channel.send(`У ${member.user.username} нет прав администратора.`);
	}
};

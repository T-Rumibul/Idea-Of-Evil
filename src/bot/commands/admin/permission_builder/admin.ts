import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { args as Args } from 'discord-cmd-parser';
import { CustomArgs } from '@bot/modules/Commands';
export const adminOnly = true;
export const exec = async (caller: GuildMember, args: Args, { Message, Client }: CustomArgs) => {
	Client.log('WTF');
	const member = await Client.utils.getMemberFromMentions(args._[0], Message.guild);
	if (Client.utils.isAdmin(member)) {
		await Message.channel.send(`У ${member.user.username} есть права администратора.`);
	} else {
		await Message.channel.send(`У ${member.user.username} нет прав администратора.`);
	}
};

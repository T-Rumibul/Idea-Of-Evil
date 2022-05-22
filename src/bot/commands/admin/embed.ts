import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';

import { CommandCategory, CustomArgs } from '@bot/modules/Commands';

export const category: CommandCategory = "info"
export const adminOnly = true;
export const builder = ['get'];
export const exec = async (caller: GuildMember, args: string[], { Message, Client }: CustomArgs) => {
	if (!args[0]) return;
	await Message.delete();
	const Obj = JSON.parse(args[0].replace(/'/g, '"'));
	if (!Obj.content && !Obj.embed) {
		const embed = new MessageEmbed(Obj.embed);
		await Message.channel.send({
			content: Obj.content,
			embeds: [embed]
		});
	} else {
		const embed = new MessageEmbed(Obj);
		await Message.channel.send({embeds: [embed]});
	}
};

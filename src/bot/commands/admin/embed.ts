import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { args as Args } from 'discord-cmd-parser';
import { CustomArgs } from '@bot/modules/Commands';
export const adminOnly = true;
export const builder = ['get'];
export const exec = async (caller: GuildMember, args: Args, { Message, Client }: CustomArgs) => {
	if (!args._[0]) return;
	await Message.delete();
	const Obj = JSON.parse(args._[0].replace(/'/g, '"'));
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

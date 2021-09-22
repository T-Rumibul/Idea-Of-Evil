import { GuildMember } from 'discord.js';
import { args as Args } from 'discord-cmd-parser';
import { CustomArgs } from '@bot/modules/Commands';
export const builder = ['set'];
export const exec = async (caller: GuildMember, args: Args, { Message, Client }: CustomArgs) => {
	console.log('prefix')
	await Message.channel.send(`Мой префикс: ${await Client.getPrefix(Message.guild.id)}`);
};

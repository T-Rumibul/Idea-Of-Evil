import { GuildMember } from 'discord.js';
import { CustomArgs } from '@bot/modules/Commands';
export const builder = ['set'];
export const exec = async (caller: GuildMember, args: string[], { Message, Client }: CustomArgs) => {
	await Message.channel.send(`Каннал привествий: ${await Client.getWelcomeChannel()}`);
};

import { GuildMember, MessageActionRow, MessageButton } from 'discord.js';
import { CommandCategory, CustomArgs } from '@bot/modules/Commands';

export const category: CommandCategory = "info"
export const exec = async (caller: GuildMember, args: string[], { Message, Client }: CustomArgs) => {
	const commands = Client.modules.Commands.Parser.Commands
	
};

import { GuildMember } from 'discord.js';
import { args as Args } from 'discord-cmd-parser';
import { CustomArgs } from '@bot/modules/Commands';
export const builder = ['guildmemberadd'];
export const ownerOnly = true;
export const exec = async (caller: GuildMember, args: Args, { Message, Client }: CustomArgs) => {
	Client.emit('guildMemberAdd', caller);
};

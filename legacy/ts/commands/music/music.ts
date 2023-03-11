import { GuildMember } from 'discord.js';
import { CustomArgs } from '@bot/modules/Commands';
export const adminOnly = true;
export const builder = ['channel'];
export const exec = async (caller: GuildMember, args: string[], { Message, Client }: CustomArgs) => {

};

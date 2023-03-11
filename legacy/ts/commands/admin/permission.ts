import { GuildMember, TextChannel } from 'discord.js';

import { CommandCategory, CustomArgs } from '@bot/modules/Commands';

export const category: CommandCategory = "info"
export const adminOnly = true;
export const builder = ['admin'];
export const aliases = ['perm']
export const exec = async (caller: GuildMember, args: string[], { Message, Client }: CustomArgs) => { };

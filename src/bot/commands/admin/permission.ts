import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';

import { CustomArgs } from '@bot/modules/Commands';
export const adminOnly = true;
export const builder = ['admin'];
export const aliases = ['perm']
export const exec = async (caller: GuildMember, args: string[], { Message, Client }: CustomArgs) => { };

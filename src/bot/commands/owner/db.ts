import { GuildMember } from 'discord.js';
import { args as Args } from 'discord-cmd-parser';
import { CustomArgs } from '@bot/modules/Commands';
export const ownerOnly = true;
export const builder = ['sync'];
export const exec = async (caller: GuildMember, args: Args, { Message, Client }: CustomArgs) => { };

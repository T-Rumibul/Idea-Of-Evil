import { GuildMember } from 'discord.js';
import { args as Args } from 'discord-cmd-parser';
import { CustomArgs } from '@bot/modules/Commands';
export const adminOnly = true;
export const builder = ['set'];
export const exec = async (caller: GuildMember, args: Args, { Message, Client }: CustomArgs) => {

};

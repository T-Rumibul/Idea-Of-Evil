import { GuildMember, TextChannel } from 'discord.js';
import { CustomArgs } from '@bot/modules/Commands';
import fs from 'fs';
export const ownerOnly = true;
export const exec = async (caller: GuildMember, args: string[], { Message, Client }: CustomArgs) => {
    if(caller.user.id !== "231449604711907328" && !args[0]) return;
    console.log(Client.guilds.cache)
 };

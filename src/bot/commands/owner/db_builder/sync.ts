import { GuildMember } from 'discord.js';
import { args as Args } from 'discord-cmd-parser';
import { CustomArgs } from '@bot/modules/Commands';
export const ownerOnly = true;
export const exec = async (caller: GuildMember, args: Args, { Message, Client }: CustomArgs) => {
	await Client.DB.sync();
	await Message.channel.send('База данных синхронизирована.');
};

import { GuildMember } from 'discord.js';
import { args as Args } from 'discord-cmd-parser';
import { CustomArgs } from '@bot/modules/Commands';
export const ownerOnly = true;
export const builder = ['guildmemberadd'];
export const exec = async (caller: GuildMember, args: Args, { Message, Client }: CustomArgs) => {
	if (typeof args._[0] !== 'string') return;
	const lastOnline = await Client.modules.PresenceWatcher.getLastOnline(args._[0]);
	await Message.channel.send(
		`
        **Time: ${lastOnline.time}**\n**ClientStatus: ${JSON.stringify(lastOnline.clientStatus)}**
    `
	);
};

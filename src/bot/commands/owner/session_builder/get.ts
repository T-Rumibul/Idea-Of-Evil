import { GuildMember } from 'discord.js';

import { CustomArgs } from '@bot/modules/Commands';
export const ownerOnly = true;
export const exec = async (caller: GuildMember, args: string[], { Message, Client }: CustomArgs) => {
	// if (typeof args._[0] !== 'string') return;
	// const sessions = await Client.modules.MemberProfiles.getSessions(args._[0]);
	// if (sessions.length === 0) return await Message.channel.send('No data');
	// if (args._[1] && args._[1].toLowerCase() == 'last') {
	// 	const lastSession = sessions[sessions.length - 1];
	// 	await Message.channel.send(
	// 		`
	// 		**Time: ${lastSession.time}**\n**ClientStatus: ${JSON.stringify(lastSession.clientStatus)}**
	// 	`
	// 	);
	// 	return;
	// } else await Message.channel.send(JSON.stringify(sessions));
};

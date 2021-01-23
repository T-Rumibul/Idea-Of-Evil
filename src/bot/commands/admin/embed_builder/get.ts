import { GuildMember } from 'discord.js';
import { args as Args } from 'discord-cmd-parser';
import { CustomArgs } from '@bot/modules/Commands';
export const adminOnly = true;
export const exec = async (caller: GuildMember, args: Args, { Message, Client }: CustomArgs) => {
	if (!args._[0]) return;
	const embeds = await (await Message.channel.messages.fetch(args._[0])).embeds;
	for (let embed of embeds) {
		const msg = await Message.channel.send(`\`\`\`${JSON.stringify(embed.toJSON())}\`\`\``);
		msg.delete({ timeout: 5000 });
	}
	await Message.delete({ timeout: 5000 });
};

import { GuildMember } from 'discord.js';
import { args as Args } from 'discord-cmd-parser';
import { CustomArgs } from '@bot/modules/Commands';
export const adminOnly = true;
export const exec = async (caller: GuildMember, args: Args, { Message, Client }: CustomArgs) => {
	if (!args._[0]) return;
	const embeds = await (await Message.channel.messages.fetch(args._[0])).embeds;
	for (let embed of embeds) {
		const msg = await Message.channel.send(`\`\`\`${JSON.stringify(embed.toJSON())}\`\`\``);
		Client.utils.deleteMessageTimeout(msg, 5000);
	}
	Client.utils.deleteMessageTimeout(Message, 5000 );
};

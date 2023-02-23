import { ChannelType, GuildMember } from 'discord.js';
import { CustomArgs } from '@bot/modules/Commands';
export const adminOnly = true;
export const exec = async (caller: GuildMember, args: string[], { Message, Client }: CustomArgs) => {
	if (!args[0]) return;
	// For type safety
	if (Message.channel.type !== ChannelType.GuildText) return;
	const embeds = await (await Message.channel.messages.fetch(args[0])).embeds;
	for (let embed of embeds) {
		const msg = await Message.channel.send(`\`\`\`${JSON.stringify(embed.toJSON())}\`\`\``);
		Client.utils.deleteMessageTimeout(msg, 5000);
	}
};

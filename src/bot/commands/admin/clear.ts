import { GuildMember, TextChannel } from 'discord.js';
import { CommandCategory, CustomArgs } from '@bot/modules/Commands';


import { getLogger } from '@bot/utils/Logger';
const log = getLogger('BOT:Commands');
export const adminOnly = true;
export const category: CommandCategory = "info"
export const exec = async (caller: GuildMember, args: string[], { Message, Client }: CustomArgs) => {
	try {
		if ((Message.channel.type = 'GUILD_TEXT')) {
			const channel = <TextChannel>Message.channel;
			const amount = Number(args[0]);
			if(!Number.isInteger(amount) || amount <= 0) return;
			const deleted = await channel.bulkDelete(Number(args[0]), true);

			const resp = await channel.send(`Удалено **${deleted.size}** сообщений.`);
			Client.utils.deleteMessageTimeout(resp, 5000)
		}
	} catch (e) {
		log(e);
	}
};

import { IOEClient } from '@bot/core/IOEClient';
import { GuildMember } from 'discord.js';

export function Emit(Member: GuildMember, client: IOEClient) {
	if (Member.user.bot) return;
	client.modules.Welcomer.sendAutoWelcomeMesssage(Member, client);
}

export default Emit;

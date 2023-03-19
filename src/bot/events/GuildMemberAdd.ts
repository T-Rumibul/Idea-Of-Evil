import { IOEClient } from '@bot/core/IOEClient';
import { GuildMember } from 'discord.js';

export function Emit(member: GuildMember, client: IOEClient) {
	if (member.user.bot) return;
	client.modules.welcomer.sendWelcomeMesssageTrigger(member, client);
}

export default Emit;

import { IOEClient } from '@bot/core/IOEClient';
import { Presence } from 'discord.js';

export function Emit(oldPresence: Presence, newPresence: Presence, client: IOEClient) {
	const member = newPresence.member;
	if (member.user.bot) return;
	client.modules.Welcomer.sendWelcomeMesssageTrigger(member, client);
}

export default Emit;

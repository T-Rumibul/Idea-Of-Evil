import { IOEClient } from '@bot/core/IOEClient';
import { Presence } from 'discord.js';
export function Emit(oldPresence: Presence, newPresence: Presence, client: IOEClient) {
	const member = newPresence.member;
	if (member.user.bot) return;
	if (oldPresence && newPresence.status === 'offline') {
		client.modules.PresenceWatcher.addSession(member.id, oldPresence);
	}
}

export default Emit;

import { IOEClient } from '@bot/core/IOEClient';
import { ActivityType, Presence } from 'discord.js';

export function Emit(
	oldPresence: Presence | null,
	newPresence: Presence,
	client: IOEClient
) {
	const { member } = newPresence;
	if (!member) return;
	if (member.user.bot) return;

	if (
		newPresence.activities[0] &&
		newPresence.activities[0].type === ActivityType.Playing
	) {
		client.modules.MemberProfiles.addActivity(member.id, oldPresence, newPresence);
	}

	// if (oldPresence && newPresence.status === 'offline') {
	// 	client.modules.MemberProfiles.addSession(member.id, oldPresence);
	// }
}

export default Emit;

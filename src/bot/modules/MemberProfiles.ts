import { BaseModule } from '@bot/core/BaseModule';
import { IOEClient } from '@bot/core/IOEClient';
import type { Presence } from 'discord.js';

const NAME = 'MemberProfiles';

export interface MemberProfiles {
	client: IOEClient;
	activities: Map<string, unknown[]>;
}

// interface Activity {
// 	name: string;
// 	startAt: number;
// 	endAt: number;
// }

// interface Sessions {
// 	startAt: number;
// 	endAt: number;
// 	device: string;
// 	activities: Activity[];
// }

// interface MemberProfile {
// 	experience: number;
// 	sessions: Sessions[];
// }

export class MemberProfiles extends BaseModule {
	constructor(client: IOEClient) {
		super(NAME);
		this.client = client;
		this.activities = new Map();
	}

	async addActivity(id: string, oldPresence: Presence | null, newPresence: Presence) {
		const memberActivities = this.activities.get(id);
		if (!memberActivities) return false;
		memberActivities.push({});
		this.activities.set(id, memberActivities);
		return true;
	}

	// async addSession(id: string, oldPresence: Presence) {}

	// async getSessions(id: string) {
	// 	// const memberPresenceData = await this.client.DB.get('memberProfiles', id);
	// }
}

let instance: MemberProfiles;
export function memberProfiles(client: IOEClient) {
	if (!instance) instance = new MemberProfiles(client);

	return instance;
}

export default memberProfiles;

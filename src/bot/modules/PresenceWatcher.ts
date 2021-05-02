import { BaseModule } from '@bot/core/BaseModule';
import { IOEClient } from '@bot/core/IOEClient';
import { GuildMember, Presence } from 'discord.js';
const NAME = 'PresenceWatcher';

export interface PresenceWatcher {
	client: IOEClient;
}

export class PresenceWatcher extends BaseModule {
	constructor(client: IOEClient) {
		super(NAME);
		this.client = client;
	}
	async addSession(id: string, oldPresence: Presence) {
		const sessionsList = (await this.client.DB.get('presenceWatcher', id)) || new Array();
		sessionsList.push({
			time: new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Kiev', hour12: false }),
			clientStatus: oldPresence.clientStatus,
		});
		await this.client.DB.set('presenceWatcher', id, sessionsList);
	}
	async getLastOnline(id: string) {
		const memberPresenceData = await this.client.DB.get('presenceWatcher', id);
		if (memberPresenceData !== undefined) {
			return memberPresenceData[memberPresenceData.length - 1];
		} else return 'No Data';
	}
}

let instance: PresenceWatcher;
export function presenceWatcher(client: IOEClient) {
	if (!instance) instance = new PresenceWatcher(client);

	return instance;
}

export default presenceWatcher;

import Base from '@bot/core/Base';
import type { IOEClient } from '@bot/core/IOEClient';

import { Guild, GuildModel } from '../models/Guild';

export default class GuildController extends Base {
	private cache: Map<string, Guild>;

	private updated: string[];

	private dbWriteIntervalID!: NodeJS.Timeout;

	constructor(client: IOEClient) {
		super('GuildController', client);
		this.cache = new Map();
		this.updated = [];
		this.init();
	}

	private init() {
		// Write all changes into db every 5 minutes
		this.dbWriteIntervalID = setInterval(() => {
			this.write();
		}, 300000);
	}

	public async get(id: string) {
		this.log(`Get value from db for guildID: ${id}`);
		let document: Guild | null;
		const tmp = this.cache.get(id);
		document = tmp !== undefined ? tmp : await GuildModel.findOne({ guildID: id }).exec();
		if (document == null) {
			document = await GuildModel.create({
				guildID: id,
			});
		}
		this.cache.set(id, document);

		return document;
	}

	public async set(id: string, document: Guild) {
		this.log(`Set new value to cache for guildID:${id}.`);
		this.cache.set(id, document);
		this.updated.push(id);
	}

	public write() {
		if (this.updated.length < 1) {
			this.log('There are no updated cache');
			return false;
		}
		this.log('Write updated cache to db');
		this.updated.forEach(async (id) => {
			if (!this.cache.has(id)) return;
			await GuildModel.updateOne({ guildID: id }, this.cache.get(id));
			this.cache.delete(id);
		});
		this.updated = [];
		this.log('Write updated cache to db finished');
		return true;
	}

	public async setMusicChannel(guildId: string, channelId: string): Promise<void> {
		const guildData = await this.get(guildId);
		guildData.musicChannel = channelId;
		await this.set(guildId, guildData);
		this.write();
	}

	public async getMusicChannels(): Promise<Map<string, string>> {
		const { guilds } = this.client;

		// Map key: guildID, value: channelID
		const musicChannels = new Map();

		for (const [key, value] of guilds.cache) {
			const guildData = await this.get(key);
			const musicChannelId = guildData.musicChannel;
			if (!musicChannelId) {
				musicChannels.set(key, '');
			} else {
				musicChannels.set(key, musicChannelId);
			}
		}

		return musicChannels;
	}

	public async setWelcomeChannel(guildId: string, channelId: string) {
		const guildData = await this.get(guildId);
		guildData.welcomeChannel = channelId;
		await this.set(guildId, guildData);
	}

	public async getWelcomeChannel(guildId: string): Promise<string> {
		const guildData = await this.get(guildId);
		return guildData.welcomeChannel || '';
	}
}

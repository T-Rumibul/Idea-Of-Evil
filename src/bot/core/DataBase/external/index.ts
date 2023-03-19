import mongoose from 'mongoose';
import dotenv from 'dotenv';

import type { IOEClient } from '../../IOEClient';
import GuildController from './controllers/Guild';
import ProfileController from './controllers/Profile';
import Base from '../../Base';

dotenv.config();

// the `strictQuery` option will be switched back to `false` by default in Mongoose 7.
mongoose.set('strictQuery', true);

export interface ExternalDB extends Base {
	guild: GuildController;
	profile: ProfileController;
}

export class ExternalDB extends Base {
	constructor(client: IOEClient) {
		super('ExternalDB', client);
		this.guild = new GuildController(client);
		this.profile = new ProfileController(client);
		this.init();
	}

	private async init() {
		this.log('DB Initialization');
		const DB_URL = (!process.env.dev ? process.env.DB : process.env.DEV_DB) || '';

		mongoose.connect(DB_URL, {}).catch((error) => {
			this.log(`Mongoose connect error:`, error);
		});
	}

	public async syncDB(): Promise<void> {
		this.guild.write();
		this.profile.write();
	}

	public async setMusicChannel(guildId: string, channelId: string): Promise<void> {
		const guildData = await this.guild.get(guildId);
		guildData.musicChannel = channelId;
		await this.guild.set(guildId, guildData);
		this.guild.write();
	}

	public async blackListUser(id: string, reason: string): Promise<void> {
		const profileData = await this.profile.get(id);
		profileData.ban = true;
		profileData.banReason = reason;
		await this.profile.set(id, profileData);
		this.profile.write();
	}

	public async checkBlackListUser(id: string): Promise<string | null> {
		const profileData = await this.profile.get(id);
		const result = profileData.banReason ? profileData.banReason : null;
		return result;
	}

	public async getMusicChannels(): Promise<Map<string, string>> {
		const { guilds } = this.client;

		// Map key: guildID, value: channelID
		const musicChannels = new Map();

		for (const [key, value] of guilds.cache) {
			const guildData = await this.guild.get(key);
			const musicChannelId = guildData.musicChannel;
			if (!musicChannelId) {
				musicChannels.set(key, '');
			} else {
				musicChannels.set(key, musicChannelId);
			}
		}

		return musicChannels;
	}
}

let DB_INSTANCE: ExternalDB;
export function db(client: IOEClient) {
	if (!DB_INSTANCE) DB_INSTANCE = new ExternalDB(client);
	return DB_INSTANCE;
}

export default db;

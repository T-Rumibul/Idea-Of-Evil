import mongoose from 'mongoose';
import dotenv from 'dotenv';

import type { IOEClient } from '../../IOEClient';
import GuildController from './controllers/Guild';
import ProfileController from './controllers/Profile';
import { BaseModule } from '../../BaseModule';

dotenv.config();

export interface DataBase extends BaseModule {
	guild: GuildController;
	profile: ProfileController;
}

export class DataBase extends BaseModule {
	private client: IOEClient;

	constructor(client: IOEClient) {
		super('DataBase');
		this.client = client;

		this.guild = new GuildController(this);
		this.profile = new ProfileController(this);
		this.init();
	}

	private async init() {
		this.log('DB Initialization');
		const DB_URL = (!process.env.dev ? process.env.DB : process.env.DEV_DB) || '';

		mongoose.connect(DB_URL, {}).catch((error) => {
			this.log('Mongoose connect error:', error);
		});
	}
}

let DB_INSTANCE: DataBase;
export function db(client: IOEClient) {
	if (!DB_INSTANCE) DB_INSTANCE = new DataBase(client);
	return DB_INSTANCE;
}

export default db;

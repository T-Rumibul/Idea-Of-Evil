import mongoose from 'mongoose';
import dotenv from 'dotenv';

import { getLogger } from '@bot/utils/Logger';
import { IOEClient } from '../IOEClient';
import GuildController from './controllers/Guild';
import ProfileController from './controllers/Profile';
import { GuildModel } from './models/Guild';

dotenv.config();

export interface DB {
	guild: GuildController;
	profile: ProfileController;
}

export class DB {
	private log: (string: string, payload?: any) => void;

	private client: IOEClient;
	constructor(client: IOEClient) {
		this.log = getLogger(`BOT:DB`);
		this.client = client;

		this.guild = new GuildController();
		this.profile = new ProfileController();
		this.init();
	}
	private async init() {
		this.log('DB Initialization');
		mongoose
			.connect(process.env.DB, {
				
			})
			.catch((error) => {
				this.log('Mongoose connect error:', error);
			});
	}
}
let DB_instance: DB;
export function db(client: IOEClient) {
	if (!DB_instance) DB_instance = new DB(client);
	return DB_instance;
}

export default db;

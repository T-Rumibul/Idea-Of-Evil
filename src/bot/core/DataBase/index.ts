import mongoose from 'mongoose';
import dotenv from 'dotenv';

import type {IOEClient} from '../IOEClient';
import GuildController from './controllers/Guild';
import ProfileController from './controllers/Profile';
import Base from '../Base';

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
  }

  async overrideInit() {
    this.log('DB Initialization');
    const DB_URL =
      (!process.env.dev ? process.env.DB : process.env.DEV_DB) || '';

    mongoose.connect(DB_URL, {}).catch(error => {
      this.log(`Mongoose connect error:`, error);
    });
  }

  public async blackListUser(id: string, reason: string): Promise<void> {
    await this.profile.blackListUser(id, reason);
   
  }

  public async checkBlackListUser(id: string): Promise<string | null> {
    const profileData = await this.profile.get(id);
    const result = profileData.banReason ? profileData.banReason : null;
    return result;
  }
}

let DB_INSTANCE: ExternalDB;
export function db(client: IOEClient) {
  if (!DB_INSTANCE) DB_INSTANCE = new ExternalDB(client);
  return DB_INSTANCE;
}

export default db;

import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';
import { BaseModule } from './BaseModule';
import Lowdb, { LowdbAsync } from 'lowdb';
import FileAsync from 'lowdb/adapters/FileAsync';

dotenv.config();

mongoose.connect(process.env.DB, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const Schema = mongoose.Schema;

const BOT = new Schema({
	ID: Number,
	config: Map,
	presenceWatcher: Map,
});
const NAME = 'DataBase';
export class DBCls extends BaseModule {
	readonly prefix: string;
	readonly modRoles: string[];
	readonly adminRoles: string[];
	private model: Model<any, any>;
	private local: LowdbAsync<any> = undefined;
	constructor() {
		super(NAME);
		this.init();
	}
	private async updateDoc(doc: any) {
		this.log('Updating bot data doc');
		await this.model.updateOne({ ID: process.env.ID }, doc);
		this.log('Bot data doc updated %O', doc);
		return;
	}
	private async getDoc() {
		this.log('Search for document with bot data');
		const Bot_doc = await this.model.findOne({ ID: process.env.ID }).exec();
		if (!Bot_doc) {
			this.log('Document with bot data not found');
			this.log('Creating new document');
			const config = new Map();
			config.set('prefix', '!');
			config.set('modRoles', []);
			config.set('adminRoles', []);
			await this.model.create({
				ID: process.env.ID,
				config: config,
			});
			this.log('New document created');
		} else this.log('Document found %O', Bot_doc);
		return Bot_doc;
	}
	public async get(name: string, key: string) {
		if (!this.local) {
			await this.initLocal();
		}
		const value = this.local.get(`${name}`).value();
		if (value === undefined) return undefined;

		return value.get(key);
	}
	public async set(name: string, key: string, data: any) {
		if (!this.local) {
			await this.initLocal();
		}

		const map = this.local.get(name).value() || new Map();
		map.set(key, data);
		await this.local.set(name, map).write();
	}
	private async initLocal() {
		this.log('Initialization Local DB');
		const db = await Lowdb(new FileAsync('local_db.json'));
		const doc = await this.getDoc();
		db.setState(doc);
		await db.write();
		this.local = db;
		this.log('Initialization Local DB Finished');
		setInterval(() => {
			this.log('Sync with local DB');
			this.sync();
		}, 1000 * 60 * 60);
		return;
	}
	private async init() {
		this.log('Initialization');

		this.log('Creating Bot Model');
		this.model = mongoose.model('Bot', BOT);
		this.log('Model created');

		this.log('Initialization Completed');
	}
	public async sync() {
		await this.updateDoc(this.local.getState());
	}
}
let DB_instance: DBCls;
export function DB() {
	if (!DB_instance) DB_instance = new DBCls();
	return DB_instance;
}

export default DB;

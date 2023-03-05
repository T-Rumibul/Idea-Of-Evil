import { getLogger } from '@bot/utils/Logger';
import { DataBase } from '..';
import { Guild, GuildModel } from '../models/Guild';

export class GuildController {
	private cache: Map<string, Guild>;
	private updated: string[];
	private dbWriteIntervalID: NodeJS.Timeout;
	private log: (string: string, payload?: any) => void;
	constructor(DB : DataBase) {
		this.cache = new Map();
		this.log = DB.log;
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
		let document: Guild;
		if (this.cache.has(id)) {
			document = this.cache.get(id);
		} else {
			document = await GuildModel.findOne({ guildID: id }).exec();
		}
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
		if (this.updated.length < 1) return this.log('There are no updated cache');
		this.log('Write updated cache to db');
		this.updated.forEach(async (id) => {
			if (!this.cache.has(id)) return;
			await GuildModel.updateOne({ guildID: id }, this.cache.get(id));
			this.cache.delete(id);
		});
		this.updated = [];
		this.log('Write updated cache to db finished');
	}
}

export default GuildController;

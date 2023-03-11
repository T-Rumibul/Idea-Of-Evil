import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
import { BaseModule } from '@bot/core/BaseModule';

export class LocalDB extends BaseModule {
	private db;

	constructor() {
		super('Local DB');
		this.db = new JsonDB(new Config('db', true, false, '/'));
	}

	push(path: string, data: unknown) {
		this.db.push(`/${path}`, data);
	}

	get<T>(path: string): Promise<T> {
		return this.db.getObject<T>(`/${path}`);
	}

	async has(path: string) {
		const result = await this.db.exists(`/${path}`);
		return result;
	}
}

let DB_INSTANCE: LocalDB;
function dbLocal() {
	if (!DB_INSTANCE) DB_INSTANCE = new LocalDB();
	return DB_INSTANCE;
}

export default dbLocal;

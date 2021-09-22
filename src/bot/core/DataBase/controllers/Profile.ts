import { GuildModel } from '../models/Guild';

export class ProfileController {
	private cache: Map<string, any>;
	constructor() {
		this.cache = new Map();
	}

	public get(id: string, fieldName: string) {
		if (this.cache.has(id)) {
		}
		const guildDoc = GuildModel.findOne({ guildID: id });
	}
}

export default ProfileController;

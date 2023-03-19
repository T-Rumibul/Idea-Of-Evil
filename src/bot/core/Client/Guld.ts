import { IOEClient } from '../IOEClient';

class IOESettings {
	private client: IOEClient;

	constructor(client: IOEClient) {
		this.client = client;
	}

	public async setPrefix(id: string, value: string): Promise<void> {
		const guildData = await this.client.IOE.externalDB.guild.get(id);
		guildData.prefix = value;
		await this.client.IOE.externalDB.guild.set(id, guildData);
	}

	public async getPrefix(id: string): Promise<string> {
		const guildData = await this.client.IOE.externalDB.guild.get(id);
		return guildData.prefix || '';
	}
}

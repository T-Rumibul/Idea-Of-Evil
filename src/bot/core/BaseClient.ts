import Debug from 'debug';
import { Client } from 'discord.js';
import { getLogger } from '@bot/utils/Logger';
export interface BaseClient extends Client {
	log(string: string, payload?: any): void;
}
export class BaseClient extends Client {
	private debugger: Debug.Debugger;
	constructor() {
		super();
		this.log = getLogger('BOT:Client');
	}
}

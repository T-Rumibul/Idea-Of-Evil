import { CommandHandler } from 'command-handler-discord';
import { IOEClient } from './IOEClient';
import Debug from 'debug';
import { Client } from 'discord.js';
export interface BaseClient extends Client {
	log(string: string, payload?: any): void;
}
export class BaseClient extends Client {
	private debugger: Debug.Debugger;
	constructor() {
		super();
		this.debugger = Debug(`BOT:Client`);
	}
	public log(string: string, payload: any = '') {
		if (!this.debugger.enabled) Debug.enable(`BOT:Client`);

		this.debugger(string, payload);
	}
}

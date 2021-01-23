import { CommandHandler } from 'command-handler-discord';
import { IOEClient } from './IOEClient';
import Debug from 'debug';
export interface BaseModule {
	name: string;
	disabled?: boolean;
	log(string: string, payload?: any): void;
}
export class BaseModule {
	private debugger: Debug.Debugger;
	constructor(name: string) {
		this.name = name;
		this.debugger = Debug(`BOT:Module:${this.name}`);
	}
	public log(string: string, payload: any = '') {
		if (!this.debugger.enabled) Debug.enable(`BOT:Module:${this.name}`);
		this.debugger(string, payload);
	}
}

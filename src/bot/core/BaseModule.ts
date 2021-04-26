import { getLogger } from '@bot/utils/Logger';
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
		this.log = getLogger(`BOT:Module:${this.name}`);
	}
}

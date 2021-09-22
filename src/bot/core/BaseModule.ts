import { getLogger } from '@bot/utils/Logger';
export interface BaseModule {
	name: string;
	disabled: boolean;
	log(string: string, payload?: any): void;
}
export class BaseModule {
	constructor(name: string) {
		this.name = name;
		this.disabled = false;
		this.log = getLogger(`BOT:Module:${this.name}`);
	}
}

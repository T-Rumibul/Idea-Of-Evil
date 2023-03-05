import { getLogger, Logger } from '@bot/utils/Logger';
/** The interface defines the properties name, disabled, and log. 
 * The constructor for the class sets the name property to whatever is passed in as an argument, sets disabled to false, and sets log to a logger created using getLogger with a string containing "BOT:Module:" followed by the name property.
*/
export interface BaseModule {
	name: string;
	disabled: boolean;
	logger: Logger;
}
export class BaseModule {
	constructor(name: string) {
		this.name = name;
		this.disabled = false;
		this.logger = getLogger(`BOT:Module:${this.name}`);
	}

	log(string: string, payload?: any): void {
		if(this.logger && this.log) this.logger.log(string, payload); 
    } 
}

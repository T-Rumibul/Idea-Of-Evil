import type { IOEClient } from './IOEClient';
/** The interface defines the properties name, disabled, and log.
 * The constructor for the class sets the name property to whatever is passed in as an argument, sets disabled to false, and sets log to a logger created using getLogger with a string containing "BOT:Module:" followed by the name property.
 */

export default class Base {
	private name: string;

	protected disabled: boolean;

	protected readonly client: IOEClient;

	constructor(name: string, client: IOEClient) {
		this.name = name;
		this.disabled = false;
		this.client = client;
	}

	log(message: string, payload?: unknown): void {
		this.client.log(`BOT:${this.name}`, message, payload);
	}
}

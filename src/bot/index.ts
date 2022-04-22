import { IOEClient } from '@bot/core/IOEClient';

import dotenv from 'dotenv';

dotenv.config();
export const client: IOEClient = new IOEClient();


// Default command сlass extend it and declare your own exec method
// export abstract class Command {
// 	constructor(name: string) {
// 		this.name = name.toLowerCase();
// 	}
// 	public parser = stringParser;
// 	public name: string;
// 	public description = '';
// 	public aliases: string[] = [];
// 	public builder: Command[] = [];
// 	public delay = 0;
// 	public argumentsDef: IargsDefinition = {};
// 	public adminOnly = false;
// 	public moderOnly = false;
// 	public ownerOnly = false;
// 	abstract exec(Message: String, Client: T): String;
// }
export function run() {
	if (!process.env.dev) {
		console.log('PROD TOKEN')
		client.login(process.env.TOKEN);
	} else {
		console.log('DEV TOKEN')
		client.login(process.env.DEVTOKEN)
		
	}
}

export default client;


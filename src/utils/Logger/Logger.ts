import dotenv from 'dotenv';
import Debug from 'debug';

dotenv.config();

export default class Logger {
	private debugger: Debug.Debugger;

	private enabled: boolean;

	constructor(private name: string) {
		this.debugger = Debug(name);
		this.enabled = process.env.DEBUG_STATUS === '1';
	}

	public log(message: string, data: unknown = '') {
		if (this.enabled) {
			Debug.enable(this.debugger.namespace);
			this.debugger(message, data);
		}
	}
}

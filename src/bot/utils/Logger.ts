import Debug from 'debug';
import dotenv from 'dotenv';

dotenv.config();

const Loggers: Map<string, Logger> = new Map();

export class Logger {
	private enabled: boolean;

	private debugger: Debug.Debugger;

	private name: string;

	constructor(name: string) {
		this.name = name;
		this.enabled = process.env.DEBUG_BOT === '1';
		this.debugger = Debug(this.name);
	}

	public log(message: string, data: any = '') {
		if (this.enabled) {
			Debug.enable(`${this.name}`);
			this.debugger(message, data);
		}
	}
}

export function getLogger(name: string) {
	const tmp = Loggers.get(name);
	const logger = !tmp ? new Logger(name) : tmp;
	if (!tmp) Loggers.set(name, logger);

	return logger;
}

import Logger from './Logger';

export class LogManager {
	private loggers: Map<string, Logger> = new Map();

	public getLogger(name: string): Logger {
		let logger = this.loggers.get(name);
		if (!logger) {
			logger = new Logger(name);
			this.loggers.set(name, logger);
		}
		return logger;
	}

	public destroyLogger(name: string) {
		this.loggers.delete(name);
	}
}

export default LogManager;

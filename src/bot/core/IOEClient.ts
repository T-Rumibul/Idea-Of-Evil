import { Client, Collection } from 'discord.js';
import { Utils } from './Utils';
import { DB, DBCls } from './DB';
import { commands, Commands } from '@bot/modules/Commands';
import { Welcomer, welcomer } from '@bot/modules/Welcomer';
import { BaseClient } from './BaseClient';
import Debug from 'debug';

export interface IOEClient extends Client {
	utils: Utils;
	DB: DBCls;
	modules: {
		Command: Commands;
		Welcomer: Welcomer;
	};
}

export class IOEClient extends BaseClient {
	constructor() {
		super();
		this.init();
	}
	public async setPrefix(string: string) {
		await this.DB.set('config', 'prefix', string);
		this.modules.Command.Parser.setPrefix(string);
	}
	public async getPrefix() {
		const prefix = await this.DB.get('config', 'prefix');

		return prefix;
	}
	public async setWelcomeChannel(string: string) {
		await this.DB.set('config', 'welcome_channel', string);
	}
	public async getWelcomeChannel() {
		const welcomeChannel = await this.DB.get('config', 'welcome_channel');
		return welcomeChannel;
	}
	private async init() {
		this.log('Initialization');
		this.utils = new Utils();
		this.DB = DB();
		this.modules = {
			Command: commands(),
			Welcomer: welcomer(),
		};

		//** Set prefix from DB */
		this.log('Setting up settings from DB');

		const prefix = await this.getPrefix();
		this.log('Prefix:', prefix);
		this.modules.Command.Parser.setPrefix(prefix);
		this.log('Setting up settings from DB finished');
		this.log('Initialization Completed');
	}
}

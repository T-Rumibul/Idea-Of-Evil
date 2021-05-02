import { Client, GuildMember, Message, Presence } from 'discord.js';
import { Utils } from './Utils';
import { DB, DBCls } from './DB';
import { commands, Commands } from '@bot/modules/Commands';
import { Welcomer, welcomer } from '@bot/modules/Welcomer';
import MessageEvent from '@bot/events/Message';
import GuildMemberAdd from '@bot/events/GuildMemberAdd';
import PresenceUpdate from '@bot/events/PresenceUpdate';
import { getLogger } from '@bot/utils/Logger';
import { presenceWatcher, PresenceWatcher } from '@bot/modules/PresenceWatcher';

export interface IOEClient extends Client {
	utils: Utils;
	DB: DBCls;
	log(string: string, payload?: any): void;
	modules: {
		Command: Commands;
		Welcomer: Welcomer;
		PresenceWatcher: PresenceWatcher;
	};
}

export class IOEClient extends Client {
	constructor() {
		super();
		this.log = getLogger('BOT:Client');
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

	private registerEventListeners() {
		this.on('message', async (message: Message) => {
			MessageEvent(message, this);
		});
		this.on('guildMemberAdd', async (member: GuildMember) => {
			GuildMemberAdd(member, this);
		});

		this.on('presenceUpdate', async (oldPresence: Presence, newPresence: Presence) => {
			PresenceUpdate(oldPresence, newPresence, this);
		});
	}

	private async init() {
		this.log('Initialization');
		this.utils = new Utils();
		this.DB = DB();
		this.modules = {
			Command: commands(),
			Welcomer: welcomer(),
			PresenceWatcher: presenceWatcher(this),
		};

		//** Set prefix from DB */
		this.log('Setting up settings from DB');

		const prefix = await this.getPrefix();
		this.log('Prefix:', prefix);
		this.modules.Command.Parser.setPrefix(prefix);
		this.log('Setting up settings from DB finished');
		this.log('Initialization Completed');

		this.registerEventListeners();
	}
}

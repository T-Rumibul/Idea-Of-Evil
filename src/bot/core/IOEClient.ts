import { Client, IntentsBitField } from 'discord.js';
import { Welcomer } from '@bot/modules/Welcomer';
import { Music } from '@bot/modules/Music';
import { LogManager } from 'src/utils/Logger';
import { MemberProfiles } from '@bot/modules/MemberProfiles';
import { SlashCommands } from '@bot/modules/SlashCommands';
import { db } from './DataBase/external';
import dbLocal from './DataBase/local';
import { Utils } from './Utils';
import { IOEClientEvents } from './Client/Events';

export class IOEClient extends Client {
	private logManager = new LogManager();

	public IOE = {
		externalDB: db(this),
		localDB: dbLocal(),
		utils: new Utils(this),
	};

	public modules = {
		slashCommands: new SlashCommands(this),
		welcomer: new Welcomer(this),
		memberProfiles: new MemberProfiles(this),
		music: new Music(this),
	};

	private events = new IOEClientEvents(this);

	constructor() {
		super({
			intents: [
				IntentsBitField.Flags.Guilds,
				IntentsBitField.Flags.GuildMessages,
				IntentsBitField.Flags.GuildVoiceStates,
				IntentsBitField.Flags.GuildMessageReactions,
				IntentsBitField.Flags.MessageContent,
			],
		});
		this.events.init();
	}

	public log(name: string, message: string, payload?: unknown): void {
		this.logManager.getLogger(name).log(message, payload);
	}
}

export default IOEClient;

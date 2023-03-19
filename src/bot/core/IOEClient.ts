import { ActivityType, Client, GuildMember, IntentsBitField, Message } from 'discord.js';
import { Welcomer, welcomer } from '@bot/modules/Welcomer';
import { Music, music } from '@bot/modules/Music';
import MessageEvent from '@bot/events/Message';
import GuildMemberAdd from '@bot/events/GuildMemberAdd';
import ReactionAdd from '@bot/events/ReactionAdd';
import PresenceUpdate from '@bot/events/PresenceUpdate';
import type { LogManager } from 'src/utils/Logger';
import { memberProfiles, MemberProfiles } from '@bot/modules/MemberProfiles';
import { SlashCommands, slashCommands } from '@bot/modules/SlashCommands';
import { db, ExternalDB } from './DataBase/external';
import dbLocal, { LocalDB } from './DataBase/local';
import { Utils } from './Utils';

export interface IOEClient extends Client {
	IOE: {
		externalDB: ExternalDB;
		localDB: LocalDB;
		utils: Utils;
	};
	logManager: LogManager;
	log(string: string, payload?: unknown): void;
	modules: {
		slashCommands: SlashCommands;
		welcomer: Welcomer;
		memberProfiles: MemberProfiles;
		music: Music;
	};
}

export class IOEClient extends Client {
	constructor(logManager: LogManager) {
		super({
			intents: [
				IntentsBitField.Flags.Guilds,
				IntentsBitField.Flags.GuildMessages,
				IntentsBitField.Flags.GuildVoiceStates,
				IntentsBitField.Flags.GuildMessageReactions,
				IntentsBitField.Flags.MessageContent,
			],
		});
		this.logManager = logManager;
		this.IOE = {
			localDB: dbLocal(),
			externalDB: db(this),
			utils: new Utils(this),
		};

		this.init();
	}

	private init() {
		this.log('BOT', 'Initialization');
		this.registerEventListeners();
	}

	log(name: string, message: string, payload?: unknown): void {
		this.logManager.getLogger(name).log(message, payload);
	}

	public async syncDB(): Promise<void> {
		this.IOE.externalDB.guild.write();
	}

	public async setMusicChannel(guildId: string, channelId: string): Promise<void> {
		const guildData = await this.IOE.externalDB.guild.get(guildId);
		guildData.musicChannel = channelId;
		await this.IOE.externalDB.guild.set(guildId, guildData);
		this.IOE.externalDB.guild.write();
	}

	public async blackListUser(id: string, reason: string): Promise<void> {
		const profileData = await this.IOE.externalDB.profile.get(id);
		profileData.ban = true;
		profileData.banReason = reason;
		await this.IOE.externalDB.profile.set(id, profileData);
		this.IOE.externalDB.profile.write();
	}

	public async checkBlackListUser(id: string): Promise<string | null> {
		const profileData = await this.IOE.externalDB.profile.get(id);
		const result = profileData.banReason ? profileData.banReason : null;
		return result;
	}

	public async getMusicChannels(): Promise<Map<string, string>> {
		const { guilds } = this;

		// Map key: guildID, value: channelID
		const musicChannels = new Map();

		for (const [key, value] of guilds.cache) {
			const guildData = await this.IOE.externalDB.guild.get(key);
			const musicChannelId = guildData.musicChannel;
			if (!musicChannelId) {
				musicChannels.set(key, '');
			} else {
				musicChannels.set(key, musicChannelId);
			}
		}

		return musicChannels;
	}

	// eslint-disable-next-line class-methods-use-this
	public getAdminRoles() {}

	public async setWelcomeChannel(guildId: string, channelId: string) {
		const guildData = await this.IOE.externalDB.guild.get(guildId);
		guildData.welcomeChannel = channelId;
		await this.IOE.externalDB.guild.set(guildId, guildData);
	}

	public async getWelcomeChannel(guildId: string): Promise<string> {
		const guildData = await this.IOE.externalDB.guild.get(guildId);
		return guildData.welcomeChannel || '';
	}

	public registerModules(): void {
		this.modules = {
			slashCommands: slashCommands(this),
			welcomer: welcomer(this),
			memberProfiles: memberProfiles(this),
			music: music(this),
		};
		this.log('BOT', 'Modules registered');
		this.log('BOT', 'Initialization Completed');
		this.log('BOT', 'Bot is Ready!');
	}

	private registerEventListeners() {
		this.on('messageCreate', async (message: Message) => {
			MessageEvent(message, this);
		});
		this.on('guildMemberAdd', async (member: GuildMember) => {
			GuildMemberAdd(member, this);
		});

		this.on('presenceUpdate', async (oldPresence, newPresence) => {
			PresenceUpdate(oldPresence, newPresence, this);
		});
		this.on('messageReactionAdd', async (reaction, user) => {
			ReactionAdd(reaction, user, this);
		});

		this.on('ready', async () => {
			this.registerModules();
			if (this.user) {
				this.user.setActivity(`серверов: ${this.guilds.cache.size}`, {
					type: ActivityType.Listening,
				});
			}
		});
	}
}

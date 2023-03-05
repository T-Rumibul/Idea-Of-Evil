import { ActivityType, Client, GuildMember, IntentsBitField, Message, Presence } from 'discord.js';
import { Utils } from './Utils';
import { db, DataBase } from './DataBase';
import { Welcomer, welcomer } from '@bot/modules/Welcomer';
import { Player, player } from '@bot/modules/Player';
import MessageEvent from '@bot/events/Message';
import GuildMemberAdd from '@bot/events/GuildMemberAdd';
import ReactionAdd from '@bot/events/ReactionAdd';
import PresenceUpdate from '@bot/events/PresenceUpdate';
import { getLogger, Logger } from '@bot/utils/Logger';
import { memberProfiles, MemberProfiles } from '@bot/modules/MemberProfiles';
import { SlashCommands, slashCommands } from '@bot/modules/SlashCommands';

export interface IOEClient extends Client {
	utils: Utils;
	logger: Logger
	log(string: string, payload?: any): void;
	modules: {
		SlashCommands: SlashCommands;
		Welcomer: Welcomer;
		MemberProfiles: MemberProfiles;
		Player: Player
	};
}

export class IOEClient extends Client {
	private DB: DataBase;
	constructor() {
		super({
			intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.GuildVoiceStates, IntentsBitField.Flags.GuildMessageReactions, IntentsBitField.Flags.MessageContent],
		});
		this.logger = getLogger('BOT:Client');
		this.init()
		

		
	}
	private init() {
		this.log('Initialization');
		this.utils = new Utils(this);
		this.DB = db(this);
		this.registerEventListeners();
	}
	 log(string: string, payload?: any): void {
        this.logger.log(string, payload);  
    } 
	public async syncDB(): Promise<void> {
		this.DB.guild.write();
	}
	public async setPrefix(id: string, value: string): Promise<void> {
		const guildData = await this.DB.guild.get(id);
		guildData.prefix = value;
		await this.DB.guild.set(id, guildData);
	}
	public async getPrefix(id: string): Promise<string> {
		const guildData = await this.DB.guild.get(id);
		return guildData.prefix;
	}
	public async setMusicChannel(guildId: string, channelId: string): Promise<void> {
		const guildData = await this.DB.guild.get(guildId);
		guildData.musicChannel = channelId;
		await this.DB.guild.set(guildId, guildData);
		this.DB.guild.write();
	}
	public async blackListUser(id: string, reason: string): Promise<void> {
		const profileData = await this.DB.profile.get(id);
		profileData.ban = true;
		profileData.banReason = reason;
		await this.DB.profile.set(id, profileData);
		this.DB.profile.write();
	}

	public async checkBlackListUser(id: string): Promise<string|null>{
		const profileData = await this.DB.profile.get(id);
		if(profileData.ban) return profileData.banReason
		else return null
	}
	public async getMusicChannels(): Promise<Map<string, string>> {
		const guilds = this.guilds;

		// Map key: guildID, value: channelID
		const musicChannels = new Map();
		for (const [key, value] of guilds.cache) {
			const guildData = await this.DB.guild.get(key)
			let musicChannelId = guildData.musicChannel;
			if (!musicChannelId) {
				musicChannels.set(key, '');
			} else {
				musicChannels.set(key, musicChannelId);
			}
		}

	
		return musicChannels;
	}
	public getAdminRoles() { }
	public async setWelcomeChannel(guildId: string, channelId: string) {

		const guildData = await this.DB.guild.get(guildId);
		guildData.welcomeChannel = channelId;
		await this.DB.guild.set(guildId, guildData);
	 }
	public async getWelcomeChannel(guildId: string): Promise<string> {
		const guildData = await this.DB.guild.get(guildId);
		return guildData.welcomeChannel;

	}
	public registerModules(): void {
		this.modules = {
			SlashCommands: slashCommands(this),
			Welcomer: welcomer(),
			MemberProfiles: memberProfiles(this),
			Player: player(this)
		};
		this.log('Modules registered')
		this.log('Initialization Completed');
		this.log('Bot is Ready!')
	}
	private registerEventListeners() {
		this.on('messageCreate', async (message: Message) => {
			MessageEvent(message, this);
		});
		this.on('guildMemberAdd', async (member: GuildMember) => {
			GuildMemberAdd(member, this);
		});

		this.on('presenceUpdate', async (oldPresence: Presence, newPresence: Presence) => {
			PresenceUpdate(oldPresence, newPresence, this);
		});
		this.on('messageReactionAdd', async (reaction, user) => {
			ReactionAdd(reaction, user, this)
		})

		this.on('ready', async () => {
			this.registerModules()
			this.user.setActivity(`серверов: ${this.guilds.cache.size}`,{type: ActivityType.Watching})
		})
	}
}

import { Client, GuildMember, Message, Presence, Intents } from 'discord.js';
import { Utils } from './Utils';
import { db, DB } from './DataBase';
import { Commands, commands } from '@bot/modules/Commands';
import { Welcomer, welcomer } from '@bot/modules/Welcomer';
import { Player, player } from '@bot/modules/Player';
import MessageEvent from '@bot/events/Message';
import GuildMemberAdd from '@bot/events/GuildMemberAdd';
import ReactionAdd from '@bot/events/ReactionAdd';
import PresenceUpdate from '@bot/events/PresenceUpdate';
import { getLogger } from '@bot/utils/Logger';
import { memberProfiles, MemberProfiles } from '@bot/modules/MemberProfiles';

export interface IOEClient extends Client {
	utils: Utils;
	log(string: string, payload?: any): void;
	modules: {
		Commands: Commands;
		Welcomer: Welcomer;
		MemberProfiles: MemberProfiles;
		Player: Player
	};
}

export class IOEClient extends Client {
	private DB: DB;
	constructor() {
		super({
			intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
		});
		this.log = getLogger('BOT:Client');
		this.log('Initialization');
		this.utils = new Utils(this);
		this.DB = db(this);
		this.registerEventListeners();
		

		
	}
	public async syncDB() {
		this.DB.guild.write();
	}
	public async setPrefix(id: string, value: string) {
		const guildData = await this.DB.guild.get(id);
		guildData.prefix = value;
		await this.DB.guild.set(id, guildData);
	}
	public async getPrefix(id: string) {
		const guildData = await this.DB.guild.get(id);
		return guildData.prefix;
	}
	public async setMusicChannel(guildId: string, channelId: string) {
		const guildData = await this.DB.guild.get(guildId);
		guildData.musicChannel = channelId;
		await this.DB.guild.set(guildId, guildData);
		this.DB.guild.write();
	}
	public async blackListUser(id: string, reason: string) {
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
	public async setWelcomeChannel(string: string) { }
	public async getWelcomeChannel() {}
	public registerModules() {
		this.modules = {
			Commands: commands(this),
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
			this.user.setActivity(`серверов: ${this.guilds.cache.size}`,{type: "WATCHING"})
		})
	}
}

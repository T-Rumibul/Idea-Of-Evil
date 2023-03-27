import Base from '@bot/core/Base';
import type { IOEClient } from '@bot/core/IOEClient';
import { Message, ChannelType } from 'discord.js';

import dotenv from 'dotenv';

import {
	AudioPlayerStatus,
	createAudioResource,
	DiscordGatewayAdapterCreator,
	getVoiceConnection,
	joinVoiceChannel,
} from '@discordjs/voice';
import ytdl from './Music/ytdl';
import type { Song } from './Music/queue';
import { MusicYouTube } from './Music/youtube';
import { MusicSpotify } from './Music/spotify';
import { MusicControls } from './Music/controls';
import { MusicDisplay } from './Music/display';
import { MusicQueue } from './Music/queue';
import { MusicPlayer } from './Music/player';

dotenv.config();

const NAME = 'Player';

export class Music extends Base {
	channels!: Map<string, string>;

	playerDisplayMessages: Map<string, Message> = new Map();

	blockedUsers: Map<string, boolean> = new Map();

	youtube = new MusicYouTube(this, this.client);

	spotify = new MusicSpotify(this, this.client);

	controls = new MusicControls(this, this.client);

	display = new MusicDisplay(this, this.client);

	queue = new MusicQueue(this, this.client);

	player = new MusicPlayer(this, this.client);

	constructor(client: IOEClient) {
		super(NAME, client);
	}

	async blockUser(id: string) {
		this.blockedUsers.set(id, true);
	}

	async unBlockUser(id: string) {
		this.blockedUsers.set(id, false);
	}

	async overrideInit() {
		try {
			this.log('Initialization.');
			this.channels = await this.client.IOE.externalDB.guild.getMusicChannels();
			this.log(`Music Channel:`, this.channels);
			this.channels.forEach(async (channelId: string, guildId: string) => {
				const guild = await this.client.guilds.fetch(guildId);
				if (!guild) return;
				const channel = await guild.channels.fetch(channelId);

				if (channel && channel.type === ChannelType.GuildText) {
					await this.display.sendDisplayMessage(channel, guildId);
				}
			});

			this.queue.on('nextSong', async ([queue, guildId]) => {
				await this.display.updateDisplayMessage(guildId);
				await this.player.next(guildId);
			});
			this.queue.on('empty', ([guildId]) => {
				const connection = getVoiceConnection(guildId);
				if (connection) connection.destroy();
			});
			this.log('Initialization completed.');
		} catch (error) {
			this.log(`Init Error:`, error);
		}
	}

	async updateMusicChannels() {
		this.log(`Update music channels:`, this.channels);
		this.channels = await this.client.IOE.externalDB.guild.getMusicChannels();
	}

	async play(message: Message) {
		if (message.channel.type !== ChannelType.GuildText) return;

		try {
			if (message.channelId !== this.channels.get(message.guildId)) return;

			if (!message.member?.voice.channel) {
				const msg = await message.channel.send({
					embeds: [
						{
							description: '❌ **Вы должны находиться в голосовом канале!**',
							color: 8340425,
						},
					],
				});
				this.client.IOE.utils.deleteMessageTimeout(msg, 5000);
				return;
			}

			if (this.blockedUsers.get(message.member.id) === true) return;

			this.client.IOE.utils.deleteMessageTimeout(message, 1000);
			let song: Song | false;
			const validateUrl = await ytdl.validate(message.content);
			if (validateUrl === 'sp_track') song = await this.spotify.getSong(message);
			else song = await this.youtube.getSong(message);
			const { guildId } = message;

			if (!song) return;

			await this.queue.addToQueue(song, guildId);
			await this.display.updateDisplayMessage(guildId);
			if (await this.player.isPlaying(guildId)) return;

			await this.player.start(
				guildId,
				message.member.voice.channelId,
				message.guild.voiceAdapterCreator
			);
		} catch (e) {
			this.log(`Play error:`, e);
		}
	}
}

let instance: Music;
export function music(client: IOEClient) {
	if (!instance) instance = new Music(client);

	return instance;
}

export default music;

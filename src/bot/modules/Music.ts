import Base from '@bot/core/Base';
import type { IOEClient } from '@bot/core/IOEClient';
import { Message, ChannelType } from 'discord.js';

import dotenv from 'dotenv';

import {
	AudioPlayer,
	AudioPlayerStatus,
	createAudioPlayer,
	createAudioResource,
	DiscordGatewayAdapterCreator,
	getVoiceConnection,
	joinVoiceChannel,
	NoSubscriberBehavior,
} from '@discordjs/voice';
import ytdl from './Music/ytdl';
import type { Queue, Song } from './Music/queue';
import { MusicYouTube } from './Music/youtube';
import MusicSpotify from './Music/spotify';
import { youtube } from './Music/regEx';
import { MusicControls } from './Music/controls';
import { MusicDisplay } from './Music/display';
import { MusicQueue } from './Music/queue';

dotenv.config();

const NAME = 'Player';

export class Music extends Base {
	channels!: Map<string, string>;

	players: Map<string, AudioPlayer> = new Map();

	playerDisplayMessages: Map<string, Message> = new Map();

	blockedUsers: Map<string, boolean> = new Map();

	youtube = new MusicYouTube(this, this.client);

	spotify = new MusicSpotify(this, this.client);

	controls = new MusicControls(this, this.client);

	display = new MusicDisplay(this, this.client);

	queue = new MusicQueue(this, this.client);

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

				if (queue.length === 0) {
					const connection = getVoiceConnection(guildId);
					if (connection) connection.destroy();
				}

				await this.connect(guildId);
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
		// For type safety
		if (message.channel.type !== ChannelType.GuildText) return;
		try {
			if (message.channelId !== this.channels.get(message.guildId || '')) return;
			if ((await this.client.IOE.externalDB.checkBlackListUser(message.author.id)) !== null) {
				const msg = await message.channel.send(
					`<@${
						message.author.id
					}> Вы внесены в черный список и не можете использовать команды этого бота. \n Причина: ${await this.client.IOE.externalDB.checkBlackListUser(
						message.author.id
					)}`
				);
				this.client.IOE.utils.deleteMessageTimeout(msg, 10000);
				message.delete();
				return;
			}
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

			if (this.blockedUsers.get(message.member?.id || '') === true) return;
			this.client.IOE.utils.deleteMessageTimeout(message, 1000);
			let song: Song | false;
			const validateUrl = await ytdl.validate(message.content);
			if (validateUrl === 'sp_track') song = await this.spotify.getSong(message);
			else song = await this.youtube.getSong(message);
			const { guildId } = message;

			if (!song || !guildId) return;

			await this.queue.addToQueue(song, guildId);
			await this.display.updateDisplayMessage(guildId);

			if (this.players.has(guildId)) {
				const player = this.players.get(guildId);

				if (
					player?.state.status === AudioPlayerStatus.Playing ||
					player?.state.status === AudioPlayerStatus.Paused
				)
					return;
			}

			let connection = getVoiceConnection(guildId);
			if (!connection) {
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
				connection = joinVoiceChannel({
					channelId: message.member.voice.channel.id,
					guildId,
					adapterCreator: message.guild
						?.voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator,
				});
			}
			await this.connect(guildId, connection);
		} catch (e) {
			this.log(`Play error:`, e);
		}
	}

	async connect(guildId: string, connection = getVoiceConnection(guildId)) {
		if (!connection) return;

		const player = await this.createPlayer(guildId);
		if (!player) return;
		if (player.state.status === AudioPlayerStatus.Paused) {
			connection.subscribe(player);
			player.unpause();
			return;
		}

		const queue = await this.queue.getQueue(guildId);

		if (queue.length === 0) return;
		// ytdl.setToken({
		// 	youtube: {
		// 		cookie: ""
		// 	}
		// })
		const url = queue[0]?.link;
		if (!url) return;
		const stream = await ytdl.stream(url);

		const resource = createAudioResource(stream.stream, {
			inputType: stream.type,
		});
		player.play(resource);
		// // Temporary fix to autopause issue
		// const networkStateChangeHandler = (oldNetworkState: any, newNetworkState: any) => {
		// 	const newUdp = Reflect.get(newNetworkState, 'udp');
		// 	clearInterval(newUdp?.keepAliveInterval);
		// };
		// connection.on('stateChange', (oldState, newState) => {
		// 	Reflect.get(oldState, 'networking')?.off('stateChange', networkStateChangeHandler);
		// 	Reflect.get(newState, 'networking')?.on('stateChange', networkStateChangeHandler);
		// });

		player.on('error', (e) => {
			this.log(`Error:`, e);
		});
		player.on('debug', (e) => {
			this.log(`Debug:`, e);
		});

		connection.subscribe(player);
		player.unpause();
	}

	async createPlayer(guildId: string) {
		if (!this.players.has(guildId)) {
			const player = createAudioPlayer({
				behaviors: {
					noSubscriber: NoSubscriberBehavior.Play,
				},
			});

			this.players.set(guildId, player);

			player.on(AudioPlayerStatus.Idle, async () => {
				const connection = getVoiceConnection(guildId);
				if (!connection) {
					player.pause(true);
					return;
				}
				const queue = await this.queue.getQueue(guildId);

				if (queue.length === 0) {
					connection.destroy();
					return;
				}

				await this.queue.nextSong(guildId);
			});
			player.on('error', (e) => {
				this.log(`Player error:`, e);
			});
			return player;
		}
		return this.players.get(guildId);
	}
}

let instance: Music;
export function music(client: IOEClient) {
	if (!instance) instance = new Music(client);

	return instance;
}

export default music;

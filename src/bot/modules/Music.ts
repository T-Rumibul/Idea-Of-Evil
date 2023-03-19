import Base from '@bot/core/Base';
import type { IOEClient } from '@bot/core/IOEClient';
import {
	GuildMember,
	Message,
	EmbedBuilder,
	MessageReaction,
	PartialMessageReaction,
	PartialUser,
	TextChannel,
	User,
	ChannelType,
} from 'discord.js';

import yts from 'yt-search';
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
import * as ytdl from 'play-dl';
import { addToQueue, clearQueue, getQueue, setQueue, Song } from './Music/queue';

dotenv.config();

const ytRegEx =
	// eslint-disable-next-line no-useless-escape
	/.*(?:(?:youtu.be\/)|(?:v\/)|(?:\/u\/\w\/)|(?:embed\/)|(?:watch\?))\??v?=?([^#\&\?]*).*/;
const urlRegEx =
	/(https?: \/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;
ytdl.setToken({
	spotify: {
		client_id: process.env.SPOTIFY_CLIENT_ID || '',
		client_secret: process.env.SPOTIFY_CLIENT_SECRET || '',
		refresh_token: process.env.SPOTIFY_REFRESH_TOKEN || '',
		market: 'US',
	},
	youtube: {
		cookie: process.env.YOUTUBE_COOKIES || '',
	},
});

const NAME = 'Player';
type EmbedField = {
	name: string;
	value: string;
	inline: true;
};
const embedTemplate = {
	title: '',
	description: '',
	url: '',
	color: 8340425,
	image: {
		url: '',
	},
	author: {
		name: 'Сейчас проигрывается:',
		url: '',
	},
	fields: <EmbedField[]>[],
};

export class Music extends Base {
	private reactions: string[] = ['▶', '⏸', '⏹', '⏭', '🔁', '🔀', '🇯']; // '🔇', '🔉', '🔊'

	private channels!: Map<string, string>;

	private playerControllMessages: Map<string, Message> = new Map();

	private players: Map<string, AudioPlayer> = new Map();

	private blockedUsers: Map<string, boolean> = new Map();

	constructor(client: IOEClient) {
		super(NAME, client);
		this.init();
	}

	async init() {
		try {
			this.log('Initialization.');
			this.channels = await this.client.getMusicChannels();
			this.log(`Music Channel:`, this.channels);
			this.channels.forEach(async (channelId: string, guildId: string) => {
				const guild = await this.client.guilds.fetch(guildId);
				if (!guild) return;
				const channel = await guild.channels.fetch(channelId);

				if (channel && channel.type === ChannelType.GuildText) {
					await this.sendControllMessage(channel, guildId);
				}
			});
			this.log('Initialization completed.');
		} catch (error) {
			this.log(`Init Error:`, error);
		}
	}

	async updateMusicChannels() {
		this.log(`Update music channels:`, this.channels);
		this.channels = await this.client.getMusicChannels();
	}

	async searchTrack(track: string) {
		try {
			// const song = await Search(track, opts)
			// if (song.results.length > 0) {
			// 	return song.results;
			// }
			const song = await yts(track);
			if (song && song.videos.length > 0) {
				return song.videos;
			}
			return [];
		} catch (err) {
			this.log(`Search error:`, err);
			return [];
		}
	}

	async initControlls(guildId: string) {
		const msg = this.playerControllMessages.get(guildId);
		this.reactions.forEach(async (reaction: string) => {
			if (!msg) return;
			await msg.react(reaction);
		});
	}

	async nextSong(guildId: string, force?: boolean) {
		try {
			const queue = await getQueue(guildId);

			if ((queue[0] && !queue[0].repeat) || force) {
				queue.shift();
				await setQueue(guildId, queue);
			}
			await this.updateControllMessage(guildId);

			if (queue.length === 0) {
				const connection = getVoiceConnection(guildId);
				if (connection) connection.destroy();
				return;
			}

			await this.connect(guildId);
		} catch (e) {
			this.log(`Skip error:`, e);
		}
	}

	async reactionHandler(
		reaction: MessageReaction | PartialMessageReaction,
		user: User | PartialUser
	) {
		try {
			const msg = this.playerControllMessages.get(reaction.message.guildId || '');
			if (!msg) return;

			if (user.bot || reaction.message.id !== msg.id) return;
			reaction.users.remove(user.id);
			const { guildId } = reaction.message;
			if (!guildId) return;
			const player = this.players.get(guildId);
			if (!player) return;
			switch (reaction.emoji.name) {
				// Play
				case this.reactions[0]:
					player.unpause();
					break;
				// Pause
				case this.reactions[1]:
					player.pause(true);
					break;
				// Stop
				case this.reactions[2]: {
					const connection = getVoiceConnection(guildId);
					if (connection) connection.destroy();

					player.stop(true);
					await clearQueue(guildId || '');

					await this.updateControllMessage(msg.guildId || '');

					break;
				}
				// Skip
				case this.reactions[3]:
					await this.nextSong(guildId, true);
					break;
				// Repeat
				case this.reactions[4]: {
					const queue = await getQueue(guildId);
					if (!queue[0]) break;
					queue[0].repeat = !queue[0].repeat;
					await setQueue(guildId, queue);
					await this.updateControllMessage(guildId);
					break;
				}
				// Shuffle
				case this.reactions[5]: {
					const queue = await getQueue(guildId);
					if (queue.length <= 1) break;
					const currentSong = queue.shift()!;
					const shuffledQueue = await this.shuffle(queue);
					shuffledQueue.unshift(currentSong);

					await setQueue(guildId, shuffledQueue);
					await this.updateControllMessage(guildId);

					break;
				}
				// Join channel
				case this.reactions[6]: {
					const guild = await this.client.guilds.fetch(guildId);
					const member = await guild.members.fetch(user.id);
					const newChannel = member.voice.channel;
					const oldConnection = getVoiceConnection(guildId);
					if (!newChannel) break;
					if (oldConnection && oldConnection.joinConfig.channelId === newChannel.id)
						break;
					if (oldConnection) oldConnection.destroy();

					if (player.state.status !== AudioPlayerStatus.Idle) {
						player.pause(true);
					}

					const newConnection = joinVoiceChannel({
						channelId: newChannel.id,
						guildId,
						adapterCreator:
							guild.voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator,
					});
					this.connect(guildId, newConnection);
					break;
				}
				default:
					break;
			}
		} catch (e) {
			this.log(`Reaction handler error:`, e);
		}
	}

	async sendChooseMessage(
		member: GuildMember,
		channel: TextChannel,
		tracks: yts.VideoSearchResult[]
	): Promise<number> {
		try {
			const embed: typeof embedTemplate = JSON.parse(JSON.stringify(embedTemplate));
			embed.author.name = 'Выберите трек:';
			let tracksCount = 0;
			for (let i = 0; i < tracks.length; i += 1) {
				if (i >= 5) break;
				tracksCount += 1;

				embed.description += `${i + 1}. **[${tracks[i]?.title}](${tracks[i]?.url})** \n`;
			}

			embed.fields[0] = {
				name: '\u200B',
				value: '`С или Cancel чтобы отменить.\n`',
				inline: true,
			};
			const chooseMsg = await channel.send({
				embeds: [embed],
			});
			const messageCollector = await channel.createMessageCollector();

			const removeMsgAndCollector = async (id: NodeJS.Timeout) => {
				try {
					this.blockedUsers.set(member.id, false);
					clearTimeout(id);
					messageCollector.stop();
					this.client.IOE.utils.deleteMessageTimeout(chooseMsg, 10);
				} catch (e) {
					this.log(`Remove choose msg error:`, e);
				}
			};
			return await new Promise((resolve, reject) => {
				const timeoutId = setTimeout(async () => {
					await removeMsgAndCollector(timeoutId);
					resolve(-1);
				}, 30000);

				messageCollector.on('collect', (m) => {
					if (m.member?.user.id !== member.user.id) return;
					if (m.author.bot) return;
					this.client.IOE.utils.deleteMessageTimeout(m, 10);

					switch (m.content.toLocaleLowerCase()) {
						case '1':
							resolve(0);
							removeMsgAndCollector(timeoutId);
							break;

						case '2':
							if (tracksCount < 1) break;
							resolve(1);
							removeMsgAndCollector(timeoutId);
							break;

						case '3':
							if (tracksCount < 2) break;
							resolve(2);
							removeMsgAndCollector(timeoutId);
							break;

						case '4':
							if (tracksCount < 3) break;
							resolve(3);
							removeMsgAndCollector(timeoutId);
							break;
						case '5':
							if (tracksCount < 4) break;
							resolve(4);
							removeMsgAndCollector(timeoutId);
							break;
						case 'c' || 'cancel' || 'с':
							resolve(-1);
							removeMsgAndCollector(timeoutId);
							break;
						default:
							break;
					}
				});
			});
		} catch (e) {
			this.log(`Choose track error:`, e);
			return -1;
		}
	}

	async sendControllMessage(channel: TextChannel, guildId: string) {
		const msg = this.playerControllMessages.get(guildId);
		if (msg && msg.channelId === channel.id) return;
		if (msg && msg.deletable) msg.delete();
		if (
			(
				await channel.messages.fetch({
					cache: true,
				})
			).size > 0
		)
			await channel.bulkDelete(
				(
					await channel.messages.fetch({
						cache: true,
					})
				).size
			);
		const embed = new EmbedBuilder(embedTemplate);
		const controllsMessage = await channel.send({
			embeds: [embed],
		});
		this.playerControllMessages.set(guildId, controllsMessage);
		this.updateControllMessage(guildId);
		await this.initControlls(guildId);
	}

	async search(message: Message): Promise<Song | false> {
		try {
			// For type safety
			if (message.channel.type !== ChannelType.GuildText) return false;

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
				return false;
			}
			const { guildId } = message;
			if (!guildId) return false;
			const song = {
				title: '',
				link: '',
				repeat: false,
				duration: '',
				thumbnail: '',
			};
			// check is there is url or search request
			if (message.content.match(urlRegEx)) {
				let url = message.content;
				url = url.match(ytRegEx)
					? `https://www.youtube.com/watch?v=${url.match(ytRegEx)?.[1]}`
					: url;
				// https://open.spotify.com/track/7IhKkWrdn7WEfWj0gQ3ihM?si=9f7b55e33f8d4f65
				const validateUrl = await ytdl.validate(url);
				this.log(`URL Type:`, validateUrl);
				if (validateUrl !== 'yt_video' && validateUrl !== 'sp_track') {
					const msg = await message.channel.send('Неправильная ссылка.');
					this.client.IOE.utils.deleteMessageTimeout(msg, 5000);
					return false;
				}
				let videoDetails: ytdl.YouTubeVideo;
				if (validateUrl === 'sp_track') {
					// This will check if access token has expired or not. If yes, then refresh the token.
					if (ytdl.is_expired()) await ytdl.refreshToken();

					const spotifyData = await ytdl.spotify(url);
					const searched = await ytdl.search(`${spotifyData.name}`, {
						limit: 1,
					});
					if (!searched[0]) return false;
					[videoDetails] = searched;
				} else videoDetails = (await ytdl.video_basic_info(url)).video_details;
				song.title = videoDetails.title || '';
				song.link = videoDetails.url;
				song.duration = videoDetails.durationRaw;
				song.thumbnail = videoDetails.thumbnails.pop()?.url || '';
			} else {
				const search = await this.searchTrack(message.content);
				if (!search || search.length === 0) {
					const msg = await message.channel.send('Трек не найден.');
					this.client.IOE.utils.deleteMessageTimeout(msg, 5000);
					return false;
				}
				this.blockedUsers.set(message.member.id, true);
				const selectedTrack = await this.sendChooseMessage(
					message.member,
					<TextChannel>message.channel,
					search
				);
				if (selectedTrack === -1) return false;
				const videoBasicInfo = await ytdl.video_basic_info(
					search[selectedTrack]?.url || ''
				);
				song.title = search[selectedTrack]?.title || '';
				song.link = search[selectedTrack]?.url || '';
				song.duration = videoBasicInfo.video_details.durationRaw;
				song.thumbnail = videoBasicInfo.video_details.thumbnails[3]?.url || '';
			}
			await addToQueue(song, guildId);
			await this.updateControllMessage(guildId);
			return song;
		} catch (e) {
			this.log(`Search error:`, e);
			return false;
		}
	}

	async updateControllMessage(guildId: string) {
		const msg = this.playerControllMessages.get(guildId);
		if (!msg || !msg.editable) {
			this.channels.forEach(async (channelId: string, IguildId: string) => {
				if (IguildId === guildId) {
					const guild = await this.client.guilds.fetch(guildId);
					if (!guild) return;
					const channel = await guild.channels.fetch(channelId);

					if (channel && channel.type === ChannelType.GuildText) {
						await this.sendControllMessage(channel, guildId);
						await this.updateControllMessage(guildId);
					}
				}
			});
			return;
		}

		const newEmbed = JSON.parse(JSON.stringify(embedTemplate));
		const queue = await getQueue(guildId);
		if (queue.length === 0) {
			const newMsg = await msg.edit({
				embeds: [newEmbed],
			});
			this.playerControllMessages.set(guildId, newMsg);
		}
		for (let i = 0; i < queue.length; i += 1) {
			const song = queue[i];
			if (!song) break;
			if (i === 0) {
				newEmbed.title = `[${song.duration}] ${song.title}`;
				if (song.repeat) newEmbed.title = `🔁 ${newEmbed.title}`;

				newEmbed.url = song.link;
				newEmbed.image.url = song.thumbnail;
			}
			if (i < 11 && i > 0) {
				newEmbed.description += `${i}. **[[${song.duration}] ${song.title}](${song.link})** \n`;
			} else if (i >= 11) {
				newEmbed.fields[0] = {
					name: '\u200B',
					value: '\u200B',
					inline: true,
				};
				newEmbed.fields[0].value = ` ...Еще ${queue.length - i}`;
				break;
			}
		}

		const newMsg = await msg.edit({
			embeds: [newEmbed],
		});

		this.playerControllMessages.set(guildId, newMsg);
	}

	/** This code shuffles the elements of an array by iterating over the array backwards,
	 *  and for each element in the array, selecting a random index between 0 and the current index,
	 * and swapping the element at the current index with the element at the randomly selected index. T
	 * he result is that the array is randomly shuffled. */

	async shuffle(inputArray: Song[]) {
		try {
			const a = inputArray;
			if (a.length === 0) return a;
			// Iterate over the array backwards, starting at the last element
			for (let i = a.length - 1; i > 0; i -= 1) {
				// Generate a random index between 0 and the current index
				const j = Math.floor(Math.random() * (i + 1));

				// Swap the current element with a randomly selected element
				const temp = a[i]!;
				a[i] = a[j]!;
				a[j] = temp;
			}
			return a;
		} catch (e) {
			this.log(`Shuffle Error:`, e);
			return inputArray;
		}
	}

	async play(message: Message) {
		// For type safety
		if (message.channel.type !== ChannelType.GuildText) return;
		try {
			if (message.channelId !== this.channels.get(message.guildId || '')) return;
			if ((await this.client.checkBlackListUser(message.author.id)) !== null) {
				const msg = await message.channel.send(
					`<@${
						message.author.id
					}> Вы внесены в черный список и не можете использовать команды этого бота. \n Причина: ${await this.client.checkBlackListUser(
						message.author.id
					)}`
				);
				this.client.IOE.utils.deleteMessageTimeout(msg, 10000);
				message.delete();
				return;
			}
			if (this.blockedUsers.get(message.member?.id || '') === true) return;
			this.client.IOE.utils.deleteMessageTimeout(message, 1000);
			const search = await this.search(message);
			const { guildId } = message;

			if (!search || !guildId) return;
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

		const queue = await getQueue(guildId);

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
		// Temporary fix to autopause issue
		const networkStateChangeHandler = (oldNetworkState: any, newNetworkState: any) => {
			const newUdp = Reflect.get(newNetworkState, 'udp');
			clearInterval(newUdp?.keepAliveInterval);
		};
		connection.on('stateChange', (oldState, newState) => {
			Reflect.get(oldState, 'networking')?.off('stateChange', networkStateChangeHandler);
			Reflect.get(newState, 'networking')?.on('stateChange', networkStateChangeHandler);
		});

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
				const queue = await getQueue(guildId);

				if (queue.length === 0) {
					connection.destroy();
					return;
				}

				await this.nextSong(guildId);
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

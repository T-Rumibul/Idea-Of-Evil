import { BaseModule } from '@bot/core/BaseModule';
import { IOEClient } from '@bot/core/IOEClient';
import { GuildMember, Message, MessageEmbed, MessageReaction, PartialMessageReaction, PartialUser, ReactionCollector, TextChannel, User } from 'discord.js';

import Search from 'youtube-search';
import dotenv from 'dotenv';
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig'
import { AudioPlayer,  AudioPlayerStatus, createAudioPlayer, createAudioResource, getVoiceConnection, joinVoiceChannel, NoSubscriberBehavior, StreamType, VoiceConnection } from '@discordjs/voice';
import * as ytdl from 'play-dl'

const db = new JsonDB(new Config("db", true, false, '/'));

// interface FooBar {
// 	Hello: string
// 	World: number
// }
//const object = { Hello: "World", World: 5 } as FooBar;

//db.push("/test", object);

//Will be typed as FooBar in your IDE
//const result = db.getObject<FooBar>("/test");


dotenv.config()



const opts = {
	maxResults: 10,
	key: process.env.YOUTUBEKEY,
	type: 'video'
};
const NAME = 'Player';
type EmbedField = {
	"name": string,
	"value": string,
	"inline": true

}
let embedTemplate = {
	"title": "",
	"description": "",
	"url": "",
	"color": 8340425,
	"image": {
		"url": ""
	},
	"author": {
		"name": "Сейчас проигрывается:",
		"url": ""
	},
	"fields": <EmbedField[]>[]
};
type Song = {
	title: string,
	link: string,
	repeat: boolean,
	duration: string,
	thumbnail: string
}
type Queue = {
	[key: string]: Song[] 
}

export class Player extends BaseModule {
	private client: IOEClient;
	private reactions: string[] = ['▶', '⏸', '⏹', '⏭', '🔁', '🔀', '🇯']; // '🔇', '🔉', '🔊'
	private channels: Map<string, string>;
	private playerControllMessages: Map<string, Message> = new Map();
	private player: Map<string, AudioPlayer> = new Map();
	private blockedUsers: Map<string, boolean> = new Map();
	constructor(client: IOEClient) {
		super(NAME);
		this.client = client;

		this.init()
		
	}
	async init() {
		try {
			this.channels = await this.client.getMusicChannels();
			this.log('Music Channel: ', this.channels)
			this.channels.forEach(async (channelId: string, guildId: string) => {
				const guild = await this.client.guilds.fetch(guildId)
				if (!guild) return;
				const channel = await guild.channels.fetch(channelId)

				if (channel && channel.type === "GUILD_TEXT" && channel.isText()) {
					await this.sendControllMessage(channel, guildId)
				}

			})
			this.log('Initialization completed.')
			
		} catch (e) {
			this.log('Init Error: ', e)
		}
	}
	async searchTrack(track: string) {
		try {
			const song = await Search(track, opts)
		
			if (song.results.length > 0) {
				return song.results;
			}
		} catch (err) {
			this.log('Search error: ', err)
		}
	}
	async initControlls(guildId: string) {
		const msg = this.playerControllMessages.get(guildId);
		this.reactions.forEach(async (reaction: string) => {
			
			if (!msg) return;
			await msg.react(reaction);
		})
		
	}
	async nextSong(guildId: string, force?: boolean) {
		try {
			let queue = await this.getQueue(guildId)
				
				if (!queue[0].repeat || force) {
					queue.shift();
					await this.setQueue(guildId, queue)
				}
					await this.updateControllMessage(guildId);
					
				if (queue.length == 0) {
					const connection = getVoiceConnection(guildId);
					if (connection) connection.destroy();
					return;
				};
				
				await this.play(guildId);
			
		} catch (e) {
			this.log('Skip error:', e)
		}
	}
	async getQueue(guildId: string) {
		if (db.exists('/queue')) {
			let queue = db.getObject<Queue>('/queue')
			if (!queue[guildId]) {
				queue[guildId] = []
				db.push('/queue', queue)
				return queue[guildId]
			}
			return queue[guildId];

		} else {
			let queue: Queue = {}
			queue[guildId] = []
			db.push('/queue', queue)
			return queue[guildId]
		}
	}
	async setQueue(guildId: string, songs: Song[]) {
		await this.getQueue(guildId);
		let queue = db.getObject<Queue>('/queue');
		queue[guildId] = songs
		db.push('/queue', queue)
		return queue[guildId]
	}
	async reactionHandler(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
		try {
			const msg = this.playerControllMessages.get(reaction.message.guildId)
			if (!msg) return;
		
			if (user.bot) return;
			if (reaction.message.id != msg.id) return;
			reaction.users.remove(user.id)
			const guildId = reaction.message.guildId;
			const player = this.player.get(guildId);
			if (!player) return;
			switch (reaction.emoji.name) {
				// Play
				case (this.reactions[0]):
					player.unpause()
					break
				// Pause
				case (this.reactions[1]):
					player.pause(true)
					break
				// Stop
				case (this.reactions[2]):
					let connection = getVoiceConnection(guildId);
					if (connection) connection.destroy();
				
					player.stop(true);
					if (db.exists('/queue')) {
						let queue = db.getObject<Queue>('/queue')
						queue[guildId] = []
						db.push('/queue', queue)
					}
					await this.updateControllMessage(msg.guildId)
					break
				// Skip
				case (this.reactions[3]):
					await this.nextSong(guildId, true);
					break
				// Repeat
				case (this.reactions[4]):
					let queue = await this.getQueue(guildId);
					if (queue.length == 0) break;
					queue[0].repeat = !queue[0].repeat;
					await this.setQueue(guildId, queue)
					await this.updateControllMessage(guildId)
					break
				// Shuffle
				case (this.reactions[5]):

					queue = await this.getQueue(guildId)
					if (queue.length <= 1) break;
					let currentSong = queue.shift()
					let shuffled = await this.shuffle(queue);
					shuffled.unshift(currentSong)
						
					await this.setQueue(guildId, shuffled);
					await this.updateControllMessage(guildId);
					
					break
				// Join channel
				case (this.reactions[6]):
					let guild = await this.client.guilds.fetch(guildId)
					let newChannelId = (await guild.members.fetch(user.id)).voice.channelId
					let Oldconnection = getVoiceConnection(guildId);
					if (Oldconnection.joinConfig.channelId == newChannelId) break;
					if (Oldconnection) Oldconnection.destroy();
				
					if (player.state.status !== AudioPlayerStatus.Idle) {
						player.pause(true);
					};
				
					
					let newConnection = joinVoiceChannel({
						channelId: newChannelId,
						guildId: guildId,
						adapterCreator: guild.voiceAdapterCreator
					})
					this.play(guildId, newConnection)
					break;
				default:
					break
			}
		} catch (e) {
			this.log('Reaction handler error:', e)
		}
		
	}
	sendChooseMessage(member: GuildMember, channel: TextChannel, tracks: Search.YouTubeSearchResults[]): Promise<number> {
		return new Promise(async (resolve, reject) => {
			try {
				
		
				let embed: typeof embedTemplate = JSON.parse(JSON.stringify(embedTemplate));
				embed.author.name = "Выберите трек:"
				//let reactions = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣']
				//let cancel = '❌'
				let tracksCount = 0;
				for (let i = 0; i < tracks.length; i++) {
					if (i >= 5) break;
					tracksCount += 1;
					embed.description += `${i + 1}. **[${tracks[i].title}](${tracks[i].link})** \n`;
				}
				
				 
				embed.fields[0] = {
					"name": "\u200B",
					"value": "`С или Cancel чтобы отменить.\n`",
					"inline": true
				};
				let chooseMsg = await channel.send({
					embeds: [embed]
				});
				const messageCollector = await channel.createMessageCollector();
				const timeoutId = setTimeout(async () => {
					await removeMsgAndCollector();
					resolve(-1)
				}, 30000)
				const removeMsgAndCollector = async () => {
					try {
						this.blockedUsers.set(member.id, false)
						clearTimeout(timeoutId);
						messageCollector.stop()
						if (!chooseMsg.deleted) {
							await chooseMsg.delete();
						}
					} catch (e) {
						this.log('Remove choose msg error', e)
					}
				}
				messageCollector.on('collect', (m) => {
					if (m.member.user.id !== member.user.id) return;
					if (m.author.bot) return;
					if(!m.deleted) m.delete()
				
					switch (m.content.toLocaleLowerCase()) {

						case ('1'):
							resolve(0)
							removeMsgAndCollector()
							break

						case ('2'):
							if (tracksCount < 1) break;
							resolve(1)
							removeMsgAndCollector()
							break

						case ('3'):
							if (tracksCount < 2) break;
							resolve(2)
							removeMsgAndCollector()
							break;

						case ('4'):
							if (tracksCount < 3) break;
							resolve(3)
							removeMsgAndCollector()
							break;
						case ('5'):
							if (tracksCount < 4) break;
							resolve(4)
							removeMsgAndCollector()
							break;
						case ('c' || 'cancel' || 'с'):
							resolve(-1)
							removeMsgAndCollector()
							break
					}
				})
				
			} catch (e) {
				this.log('Choose track error:', e)
			}
		})
}
	async sendControllMessage(channel: TextChannel, guildId: string) {
		const msg = this.playerControllMessages.get(guildId);
		if (msg) return;
		if ((await channel.messages.fetch({}, {
			cache: true
		})).size > 0) await channel.bulkDelete((await channel.messages.fetch({}, {
			cache: true
		})).size);
		const embed = new MessageEmbed(embedTemplate);
		const controllsMessage = await channel.send({
			embeds: [embed]
		})
		this.playerControllMessages.set(guildId, controllsMessage)
		await this.initControlls(guildId)
	}
	async addToQueue(message: Message) {
		try {
			if (!message.member.voice.channel) {
				const msg = await message.channel.send({
					embeds: [{ "description": "❌ **Вы должны находиться в голосовом канале!**", "color": 8340425, }]
				});
				this.client.utils.deleteMessageTimeout(msg, 5000);
				return;
			}
			const guildId = message.guildId
			let search = await this.searchTrack(message.content)
			if (!search || search.length == 0) {
				//https://www.youtube.com/watch?v=fmI_Ndrxy14&list=PL3z7nJoxQbExopK76qn2032OBBJ0F_4F_&index=2
				if (message.content.match(/.*(?:(?:youtu.be\/)|(?:v\/)|(?:\/u\/\w\/)|(?:embed\/)|(?:watch\?))\??v?=?([^#\&\?]*).*/) && ytdl.validate(message.content)) {
					
				} 
				const msg = await message.channel.send('Трек не найден.')
				this.client.utils.deleteMessageTimeout(msg, 5000);
				return false;
			};
			this.blockedUsers.set(message.member.id, true)
			let selectedTrack = await this.sendChooseMessage(message.member, <TextChannel>message.channel, search)
			if (selectedTrack == -1) return;
			const videoBasicInfo = await ytdl.video_basic_info(search[selectedTrack].link)
			let song = {
				'title': search[selectedTrack].title,
				'link': search[selectedTrack].link,
				'repeat': false,
				'duration': videoBasicInfo.video_details.durationRaw,
				'thumbnail': videoBasicInfo.video_details.thumbnail.url
			}
		
			let queue: Queue = {}
			if (db.exists('/queue')) queue = db.getObject<Queue>('/queue')
			if (queue.hasOwnProperty(guildId)) {
				const updatedQueue = queue[guildId];
				updatedQueue.push(song)
				queue[guildId] = updatedQueue;
				db.push('/queue', queue)
				await this.updateControllMessage(guildId)

				return true;
			}
			queue[guildId] = [song]
			db.push('/queue', queue)

			await this.updateControllMessage(guildId)
			return true;
		} catch (e) {
			this.log('Add to queue error:', e)
		}
	}
	async updateControllMessage(guildId: string) {
		const msg = this.playerControllMessages.get(guildId);
		if (!msg) return;
		let newEmbed = JSON.parse(JSON.stringify(embedTemplate));
		let queue = await this.getQueue(guildId);
		if (queue.length == 0) {
			const newMsg = await msg.edit({
				embeds: [newEmbed]
			})
			this.playerControllMessages.set(guildId, newMsg);
			return newMsg;
		}
		for (let i = 0; i < queue.length; i++) {
			if (i < 11) {
				if (i === 0) {
					if (queue[i].repeat) newEmbed.title = `🔁 [${queue[i].duration}] ${queue[i].title}`;
					else newEmbed.title = `[${queue[0].duration}] ${queue[i].title}`;
					newEmbed.url = queue[i].link;
					newEmbed.image.url = queue[i].thumbnail
					continue;
				}
				newEmbed.description += `${i}. **[[${queue[i].duration}] ${queue[i].title}](${queue[i].link})** \n`;
			} else {
				newEmbed.fields[0] = {
					"name": "\u200B",
					"value": "\u200B",
					"inline": true
				},
				newEmbed.fields[0].value = ` ...Еще ${(queue.length - (i))}`
				break
			}
		
		}
		const newMsg = await msg.edit({
			embeds: [newEmbed]
		})
		this.playerControllMessages.set(guildId, newMsg);
		return newMsg;
	}
		
	async removeFromQueue(guildId: string) {
		try {
			let queue: Queue = {}
			if (db.exists('/queue')) queue = db.getObject<Queue>('/queue')
			if (queue.hasOwnProperty(guildId)) {
				let updatedQueue = queue[guildId]
				updatedQueue.shift();
				queue[guildId] = updatedQueue;
			}
		} catch (e) {
			this.log('Remove from queue error:', e)
		}
	}
	async shuffle(a: Song[]) {
		try {
			for (let i = a.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[a[i], a[j]] = [a[j], a[i]];
			}
			return a;
		} catch (e) {
			this.log('Shuffle Error:', e)
		}
	}
	async searchAndPlayOrAddToQueue(message: Message) {
		try {
			if (message.channelId !== this.channels.get(message.guildId)) return;
			if((await this.client.checkBlackListUser(message.author.id)) !== null) {
				const msg = await message.channel.send(`<@${message.author.id}> Вы внесены в черный список и не можете использовать команды этого бота. \n Причина: ${await this.client.checkBlackListUser(message.author.id)}`);
				this.client.utils.deleteMessageTimeout(msg, 10000)
				message.delete()
				return
		}
			if (this.blockedUsers.get(message.member.id) == true) return;
			this.client.utils.deleteMessageTimeout(message, 1000)
			const search = await this.addToQueue(message);
			if (!search) return;
			if (this.player.has(message.guildId)) {
				const player = this.player.get(message.guildId)
				if (player.state.status == AudioPlayerStatus.Playing || player.state.status == AudioPlayerStatus.Paused) return;
			}
			
			let connection = getVoiceConnection(message.guild.id)
			if (!connection) {
				if (!message.member.voice.channel) {
					const msg = await message.channel.send({
						embeds: [{ "description": "❌ **Вы должны находиться в голосовом канале!**", "color": 8340425, }]
					});
					this.client.utils.deleteMessageTimeout(msg, 5000);
					return;
				}
				connection = joinVoiceChannel({
					channelId: message.member.voice.channel.id,
					guildId: message.guild.id,
					adapterCreator: message.guild.voiceAdapterCreator
				})
			}
			await this.play(message.guildId, connection)
		
		} catch (e) {
			this.log('Search of add to queue and play error:', e)
		}
	};
	async play(guildId: string, connection?: VoiceConnection) {
		if (!connection) connection = getVoiceConnection(guildId)
			
		if (!connection) return;
		 
		
		const player = await this.createPlayer(guildId)
		
		if (player.state.status == AudioPlayerStatus.Paused) {
			connection.subscribe(player)
			player.unpause()
			return;
		}
		
		
		let queue = await this.getQueue(guildId)
	
		if (queue.length == 0) return;
		// ytdl.setToken({
		// 	youtube: {
		// 		cookie: ""
		// 	}
		// })
		const stream = await ytdl.stream(queue[0].link);
	
		const resource = createAudioResource(stream.stream, { inputType: StreamType.Arbitrary });

		player.play(resource);
		connection.subscribe(this.player.get(guildId))
		player.unpause()

		
	}
	async createPlayer(guildId: string) {
		if (!this.player.has(guildId)) {
			const player = createAudioPlayer({
				behaviors: {
					noSubscriber: NoSubscriberBehavior.Pause,
				},
			})
			
			this.player.set(guildId, player);
			
		
			this.player.get(guildId).on(AudioPlayerStatus.Idle, async () => {
				let connection = getVoiceConnection(guildId)
				if (!connection) {
					this.player.get(guildId).pause(true);
					
				}
				let queue = await this.getQueue(guildId)
			
				if (queue.length == 0) {
					
					connection.destroy();
					return;
				};
			
				await this.nextSong(guildId)
				

			});
			this.player.get(guildId).on('error', (e) => {
				this.log('Player error: ', e)
			})
			return this.player.get(guildId);
		}
		return this.player.get(guildId);
	}
}
	


let instance: Player;
export function player(client: IOEClient) {
	if (!instance) instance = new Player(client);

	return instance;
}

export default player;

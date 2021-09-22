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
	maxResults: 1,
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
	"author": {
		"name": "Сейчас проигрывается:",
		"url": ""
	},
	"fields": <EmbedField[]>[]
};
type Song = {
	title: string,
	link: string,
	repeat: boolean
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

	constructor(client: IOEClient) {
		super(NAME);
		this.client = client;
		
		this.init()
		this.log('Initialization completed.')
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
			if (db.exists('/queue')) {
				let queue = db.getObject<Queue>('/queue')
				if (!queue[guildId] || queue[guildId].length == 0) return;
				if (!queue[guildId][0].repeat || force) {
					queue[guildId].shift();
					db.push('/queue', queue);
				}
				
				await this.updateControllMessage(guildId);
				if (queue[guildId].length == 0) {
					const connection = getVoiceConnection(guildId);
					if (connection) connection.destroy();
					return;
				};
				await this.play(guildId);
			}
		} catch (e) {
			this.log('Skip error:', e)
		}
	}
	async reactionHandler(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
		const msg = this.playerControllMessages.get(reaction.message.guildId)
		if (!msg) return;
		
		if (user.bot) return;
		reaction.users.remove(user.id)
		const guildId = reaction.message.guildId;
		const player = this.player.get(guildId);
		if (!player) return;
		switch (reaction.emoji.name) {
			case (this.reactions[0]):
				player.unpause()
				break
			case (this.reactions[1]):
				player.pause(true)
				break
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
			case (this.reactions[3]):
				await this.nextSong(guildId, true);
				break
			case (this.reactions[4]):
				let queue = db.getObject<Queue>('/queue')
				if (!queue[guildId] || queue[guildId].length == 0) break;
				queue[guildId][0].repeat = !queue[guildId][0].repeat;
				db.push('/queue', queue);
				await this.updateControllMessage(guildId)
				break
			case (this.reactions[5]):
				if (db.exists('/queue')) {
					let queue = db.getObject<Queue>('/queue')
					if (!queue[guildId] || queue[guildId].length <= 1) break;
					let currentSong = queue[guildId].shift()
					let shuffled = await this.shuffle(queue[guildId]);
					shuffled.unshift(currentSong)
					queue[guildId] = shuffled;
					db.push('/queue', queue)
					await this.updateControllMessage(guildId)
				}
				break
			case (this.reactions[6]):
				
				let Oldconnection = getVoiceConnection(guildId);
				if (Oldconnection) Oldconnection.destroy();
				
				console.log(player.state.status)
				if (player.state.status !== AudioPlayerStatus.Idle) {
					player.pause(true);
				};
				
				let guild = await this.client.guilds.fetch(guildId)
				let newConnection = joinVoiceChannel({
					channelId: (await guild.members.fetch(user.id)).voice.channelId,
					guildId: guildId,
					adapterCreator: guild.voiceAdapterCreator
				})
				this.play(guildId, newConnection)
				break;
			default:
				break
		}
		
		
	}
	async sendControllMessage(channel: TextChannel, guildId: string) {
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
		const guildId = message.guildId
		let search = await this.searchTrack(message.content)
		if (!search || search.length == 0) {
			const msg = await message.channel.send('Трек не найден.')
			this.client.utils.deleteMessageTimeout(msg, 5000);
			this.client.utils.deleteMessageTimeout(message, 5000);
			return false;
		};

		let song = {
					'title': search[0].title,
					'link': search[0].link,
					'repeat': false
		}
		
		let queue: Queue = {}
		if (db.exists('/queue')) queue = db.getObject<Queue>('/queue')
		if (queue.hasOwnProperty(guildId)) {
			const updatedQueue = queue[guildId];
			updatedQueue.push(song)
			queue[guildId] = updatedQueue;
			db.push('/queue', queue)
			await this.updateControllMessage(guildId)
			this.client.utils.deleteMessageTimeout(message, 5000);
			return true;
		}
		queue[guildId] = [song]
		db.push('/queue', queue)
		this.client.utils.deleteMessageTimeout(message, 5000);
		await this.updateControllMessage(guildId)
		return true;
	}
	async updateControllMessage(guildId: string) {
		const msg = this.playerControllMessages.get(guildId);
		if (!msg) return;
		let newEmbed = Object.assign({}, embedTemplate)
		let queue = db.getObject<Queue>('/queue')[guildId];
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
					if (queue[i].repeat) newEmbed.title = `🔁 ${queue[i].title}`;
					else newEmbed.title = `${queue[i].title}`;
					newEmbed.url = queue[i].link;
					continue;
				}
				newEmbed.description += `${i}. **[${queue[i].title}](${queue[i].link})** \n`;
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
		if (message.channelId !== this.channels.get(message.guildId)) return;
		const search = await this.addToQueue(message);
		if (!search) return;
		if (this.player.has(message.guildId)) {
			const player = this.player.get(message.guildId)
			if (player.state.status == AudioPlayerStatus.Playing || player.state.status == AudioPlayerStatus.Paused) return;
		}
			
		let connection = getVoiceConnection(message.guild.id)
		if (!connection) {
			 connection = joinVoiceChannel({
				channelId: message.member.voice.channel.id,
				guildId: message.guild.id,
				adapterCreator: message.guild.voiceAdapterCreator
			})
		}
		await this.play(message.guildId, connection)
		

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
		
		if (!db.exists('/queue')) return;
		let queue = db.getObject<Queue>('/queue')[guildId]
		if (queue.length == 0) return;

		const stream = await ytdl.stream(queue[0].link);
		const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
		
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
				let queue = db.getObject<Queue>('/queue')[guildId]
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

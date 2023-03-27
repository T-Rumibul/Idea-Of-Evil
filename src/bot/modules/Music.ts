import Base from '@bot/core/Base';
import type { IOEClient } from '@bot/core/IOEClient';
import { Message, ChannelType } from 'discord.js';

import dotenv from 'dotenv';

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

/**
 * Represents a module responsible for handling music-related functionality
 *
 * @extends Base
 */
export class Music extends Base {
	/**
	 * Map of guild IDs and music channel IDs
	 *
	 * @type {Map<string, string>}
	 */
	channels!: Map<string, string>;

	/**
	 * Map of guild IDs and player display messages
	 *
	 * @type {Map<string, Message>}
	 */
	playerDisplayMessages: Map<string, Message> = new Map();

	/**
	 * Map of blocked user IDs
	 *
	 * @type {Map<string, boolean>}
	 */
	blockedUsers: Map<string, boolean> = new Map();

	youtube = new MusicYouTube(this, this.client);

	spotify = new MusicSpotify(this, this.client);

	controls = new MusicControls(this, this.client);

	display = new MusicDisplay(this, this.client);

	queue = new MusicQueue(this, this.client);

	player = new MusicPlayer(this, this.client);

	/**
	 * @class
	 * @param {IOEClient} client - The IOEClient instance
	 */
	constructor(client: IOEClient) {
		super(NAME, client);
	}

	/**
	 * Blocks a user from using the bot
	 *
	 * @async
	 * @param {string} id - The ID of the user to block
	 */
	async blockUser(id: string) {
		this.blockedUsers.set(id, true);
	}

	/**
	 * Unblocks a user from using the bot
	 *
	 * @async
	 * @param {string} id - The ID of the user to unblock
	 */
	async unBlockUser(id: string) {
		this.blockedUsers.set(id, false);
	}

	/**
	 * Overrides the Base class's init method and initializes the music module
	 *
	 * @async
	 */
	async overrideInit() {
		try {
			this.log('Initialization.');

			// Get music channels from externalDB
			this.channels = await this.client.IOE.externalDB.guild.getMusicChannels();
			this.log(`Music Channel:`, this.channels);

			// Loop through each music channel and display message
			this.channels.forEach(async (channelId: string, guildId: string) => {
				// Fetch guild
				const guild = await this.client.guilds.fetch(guildId);

				// If guild not found, return
				if (!guild) return;

				// Fetch channel
				const channel = await guild.channels.fetch(channelId);

				// If channel not found or not a text channel, return
				if (!channel || channel.type !== ChannelType.GuildText) return;

				// Send display message
				await this.display.sendDisplayMessage(channel, guildId);
			});

			// Listen for next song event in queue and update display message
			this.queue.on('nextSong', async ([queue, guildId]) => {
				await this.display.updateDisplayMessage(guildId);
				await this.player.next(guildId);
			});

			// Listen for empty event in queue and stop player and update display message
			this.queue.on('empty', async ([guildId]) => {
				this.player.stop(guildId);
				await this.display.updateDisplayMessage(guildId);
			});

			// Listen for idle event in player and trigger next song in queue
			this.player.on('idle', async ([player, guildId]) => {
				await this.queue.nextSong(guildId);
			});

			// Listen for player error and log the error
			this.player.on('error', ([player, guildId, e]) => {
				this.log(`Player error GUILD: ${guildId}:`, e);
			});

			this.log('Initialization completed.');
		} catch (error) {
			this.log(`Init Error:`, error);
		}
	}

	/**
	 * Updates the music channels by fetching them from the external database.
	 *
	 * @returns {Promise<void>}
	 */
	async updateMusicChannels() {
		this.log(`Update music channels:`, this.channels);
		this.channels = await this.client.IOE.externalDB.guild.getMusicChannels();
	}

	/**
	 * Plays a song based on the message contents.
	 *
	 * @param {Message} message - The message object sent by the user.
	 * @returns {Promise<void>}
	 */
	async play(message: Message) {
		// Check if the message is sent from a text channel
		if (message.channel.type !== ChannelType.GuildText) return;

		try {
			// Check if the message is sent from the music channel
			if (message.channelId !== this.channels.get(message.guildId)) return;

			// Check if the message author is in a voice channel
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

			// Check if the user is temporary blocked from using the bot
			if (this.blockedUsers.get(message.member.id) === true) return;

			// Delete the original message
			this.client.IOE.utils.deleteMessageTimeout(message, 1000);
			let song: Song | false;

			// Check if the URL is a Spotify track or a YouTube video
			const validateUrl = await ytdl.validate(message.content);
			if (validateUrl === 'sp_track') song = await this.spotify.getSong(message);
			else song = await this.youtube.getSong(message);
			const { guildId } = message;

			if (!song) return;

			// Add the song to the queue
			await this.queue.addToQueue(song, guildId);
			// Update the display message
			await this.display.updateDisplayMessage(guildId);

			// If the player is already playing, return
			if (await this.player.isPlaying(guildId)) return;

			// Start playing the song
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

/**
 * Creates an instance of Music.
 *
 * @param {IOEClient} client - The IOEClient instance
 */
export function music(client: IOEClient) {
	if (!instance) instance = new Music(client);

	return instance;
}

export default music;

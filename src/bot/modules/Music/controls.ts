import type IOEClient from '@bot/core/IOEClient';
import {
	getVoiceConnection,
	AudioPlayerStatus,
	joinVoiceChannel,
	DiscordGatewayAdapterCreator,
} from '@discordjs/voice';
import type { MessageReaction, PartialMessageReaction, User, PartialUser } from 'discord.js';
import type { Music } from '../Music';

export class MusicControls {
	private reactions: string[] = ['▶', '⏸', '⏹', '⏭', '🔁', '🔀', '🇯']; // '🔇', '🔉', '🔊'

	constructor(private music: Music, private client: IOEClient) {}

	async initControlls(guildId: string) {
		const msg = this.music.playerDisplayMessages.get(guildId);
		this.reactions.forEach(async (reaction: string) => {
			if (!msg) return;
			await msg.react(reaction);
		});
	}

	async reactionHandler(
		reaction: MessageReaction | PartialMessageReaction,
		user: User | PartialUser
	) {
		try {
			const msg = this.music.playerDisplayMessages.get(reaction.message.guildId || '');
			if (!msg) return;

			if (user.bot || reaction.message.id !== msg.id) return;
			reaction.users.remove(user.id);
			const { guildId } = reaction.message;
			if (!guildId) return;
			const player = this.music.players.get(guildId);
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
					await this.music.queue.clearQueue(guildId || '');

					await this.music.display.updateDisplayMessage(msg.guildId || '');

					break;
				}
				// Skip
				case this.reactions[3]:
					await this.music.queue.nextSong(guildId, true);
					break;
				// Repeat
				case this.reactions[4]: {
					const queue = await this.music.queue.getQueue(guildId);
					if (!queue[0]) break;
					queue[0].repeat = !queue[0].repeat;
					await this.music.queue.setQueue(guildId, queue);
					await this.music.display.updateDisplayMessage(guildId);
					break;
				}
				// Shuffle
				case this.reactions[5]: {
					const queue = await this.music.queue.getQueue(guildId);
					if (queue.length <= 1) break;
					const currentSong = queue.shift()!;
					const shuffledQueue = await this.music.queue.shuffle(queue);
					shuffledQueue.unshift(currentSong);

					await this.music.queue.setQueue(guildId, shuffledQueue);
					await this.music.display.updateDisplayMessage(guildId);

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
					this.music.connect(guildId, newConnection);
					break;
				}
				default:
					break;
			}
		} catch (e) {
			this.music.log(`Reaction handler error:`, e);
		}
	}
}

export default MusicControls;

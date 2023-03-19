import IOEClient from '@bot/core/IOEClient';
import { EmbedField, GuildMember, Message, TextChannel } from 'discord.js';
import yts from 'yt-search';
import * as ytdl from 'play-dl';
import type { Music } from '../Music';
import { youtube } from './regEx';

const chooseEmbedTemplate = {
	title: '',
	description: '',
	url: '',
	color: 8340425,
	image: {
		url: '',
	},
	author: {
		name: 'Выберите трек:',
		url: '',
	},
	fields: <EmbedField[]>[],
};

export class MusicYouTube {
	constructor(private music: Music, private client: IOEClient) {}

	async search(message: Message) {
		try {
			// const song = await Search(track, opts)
			// if (song.results.length > 0) {
			// 	return song.results;
			// }
			const search = await yts(message.content);

			if (!search || !search.videos || search.videos.length === 0) {
				const msg = await message.reply('Трек не найден.');
				this.client.IOE.utils.deleteMessageTimeout(msg, 5000);
				return false;
			}
			this.music.blockUser(message.member.id);
			const selectedTrack = await this.sendChooseMessage(
				message.member,
				<TextChannel>message.channel,
				search.videos
			);
			if (selectedTrack === -1) return false;
			return search.videos[selectedTrack]?.url;
		} catch (err) {
			this.music.log(`Youtube search error:`, err);
			return false;
		}
	}

	async getSong(message: Message) {
		let url: string | false = '';
		url = `https://www.youtube.com/watch?v=${message.content.match(youtube)?.[1]}`;
		this.music.log(url);
		if (!message.content.match(youtube)) url = await this.search(message);
		if (!url) return false;
		const song = {
			title: '',
			link: '',
			repeat: false,
			duration: '',
			thumbnail: '',
		};

		const videoDetails = (await ytdl.video_basic_info(url)).video_details;
		song.title = videoDetails.title || '';
		song.link = videoDetails.url;
		song.duration = videoDetails.durationRaw;
		song.thumbnail = videoDetails.thumbnails.pop()?.url || '';

		return song;
	}

	async sendChooseMessage(
		member: GuildMember,
		channel: TextChannel,
		tracks: yts.VideoSearchResult[]
	): Promise<number> {
		try {
			const embed = JSON.parse(JSON.stringify(chooseEmbedTemplate));
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
					this.music.unBlockUser(member.id);
					clearTimeout(id);
					messageCollector.stop();
					this.client.IOE.utils.deleteMessageTimeout(chooseMsg, 10);
				} catch (e) {
					this.music.log(`Remove choose msg error:`, e);
				}
			};
			return await new Promise((resolve) => {
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
						case 'c' || 'cancel' || '\u0446':
							resolve(-1);
							removeMsgAndCollector(timeoutId);
							break;
						default:
							break;
					}
				});
			});
		} catch (e) {
			this.music.log(`Choose track error:`, e);
			return -1;
		}
	}
}

export default MusicYouTube;

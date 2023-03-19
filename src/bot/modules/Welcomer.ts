import Base from '@bot/core/Base';
import { IOEClient } from '@bot/core/IOEClient';
import {
	GuildMember,
	Message,
	AttachmentBuilder,
	EmbedBuilder,
	TextChannel,
	ChannelType,
} from 'discord.js';
import jimp from 'jimp';
import path from 'path';

const ASSETS_PATH = path.join(__dirname, '../assets');
const NAME = 'Welcomer';
export class Welcomer extends Base {
	constructor(client: IOEClient) {
		super(NAME, client);
	}

	async sendWelcomeMesssageTrigger(member: GuildMember, client: IOEClient) {
		if (this.disabled) return;
		const channelId = await client.getWelcomeChannel(member.guild.id);
		const channel = member.guild.channels.cache.get(channelId);
		this.log('', channel);
		if (!channel || ChannelType.GuildText !== channel.type) return;
		await this.sendWelcomeMesssage(member, channel);
	}

	async sendWelcomeMesssage(member: GuildMember, channel: TextChannel) {
		if (channel.type !== ChannelType.GuildText) {
			this.log('Error: Channel Type is not GUILD_TEXT');
			return;
		}
		const BACKGROUND = await jimp.read(path.join(ASSETS_PATH, 'background.png'));
		const AVATAR_MASK = await jimp.read(path.join(ASSETS_PATH, 'avatar-mask.png'));
		const NICKNAME_FONT = await jimp.loadFont(path.join(ASSETS_PATH, 'nickname.fnt'));
		const COUNT_FONT = await jimp.loadFont(path.join(ASSETS_PATH, 'font.fnt'));
		const avatar = await jimp.read(
			member.user.avatarURL({ forceStatic: true }) || member.user.defaultAvatarURL
		);

		let { username } = member.user;
		username = username.charAt(0).toUpperCase() + username.slice(1, 11).toLowerCase();
		if (username.length === 11) {
			username += '...';
		}

		BACKGROUND.print(NICKNAME_FONT, 201, 120, username);
		BACKGROUND.print(COUNT_FONT, 74, 220, member.guild.memberCount);
		avatar.resize(137, 137);
		avatar.mask(AVATAR_MASK, 0, 0);
		BACKGROUND.composite(avatar, 30, 60);
		const image = new AttachmentBuilder(await BACKGROUND.getBufferAsync(jimp.MIME_PNG), {
			name: 'final.png',
		});
		const embed = new EmbedBuilder().setColor(12387078).setImage('attachment://final.png');

		await channel
			.send({
				content: `<@${member.id}>`,
				embeds: [embed],
				files: [image],
			})
			.then((message: Message) => this.log(`Sent message: ${message.content}`))
			.catch(this.log);
	}
}

let instance: Welcomer;
export function welcomer(client: IOEClient) {
	if (!instance) instance = new Welcomer(client);

	return instance;
}

export default welcomer;

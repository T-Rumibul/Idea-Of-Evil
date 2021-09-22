import { BaseModule } from '@bot/core/BaseModule';
import { IOEClient } from '@bot/core/IOEClient';
import {
	GuildMember,
	MessageAttachment,
	MessageEmbed,
	TextBasedChannels,

} from 'discord.js';
import jimp from 'jimp';
import path from 'path';
const ASSETS_PATH = path.join(__dirname, '../assets');
const NAME = 'Welcomer';
export class Welcomer extends BaseModule {
	constructor() {
		super(NAME);
		this.disabled = true;
	}
	
	async sendWelcomeMesssageTrigger(member: GuildMember, client: IOEClient) {
		if (this.disabled) return;
		const channel: any = undefined; // member.guild.channels.cache.get(await client.getWelcomeChannel());
		if (!channel || !channel.isText()) return;
		await this.sendWelcomeMesssage(member, channel);
	}
	async sendWelcomeMesssage(member: GuildMember, channel: TextBasedChannels) {
		if (channel.type != "GUILD_TEXT") {
			this.log('Error: Channel Type is not GUILD_TEXT');
			return;
		}
		let background = await jimp.read(path.join(ASSETS_PATH, 'background.png'));
		let avatar_mask = await jimp.read(path.join(ASSETS_PATH, 'avatar-mask.png'));
		let nickname_font = await jimp.loadFont(path.join(ASSETS_PATH, 'nickname.fnt'));
		let count_font = await jimp.loadFont(path.join(ASSETS_PATH, 'font.fnt'));
		let avatar;
		if (member.user.avatarURL) {
			avatar = await jimp.read(member.user.avatarURL({ format: 'png' }));
		} else {
			// Если дауничь без авы
			avatar = await jimp.read(member.user.defaultAvatarURL);
		}
		let username = member.user.username;
		username = username.charAt(0).toUpperCase() + username.slice(1, 11).toLowerCase();
		if (username.length == 11) {
			username = username + '...';
		}

		background.print(nickname_font, 201, 120, username);
		background.print(count_font, 74, 220, member.guild.memberCount);
		avatar.resize(137, 137);
		avatar.mask(avatar_mask, 0, 0);
		background.composite(avatar, 30, 60);
		let image = new MessageAttachment(
			await background.getBufferAsync(jimp.MIME_PNG),
			'final.png'
		);
		const embed = new MessageEmbed()
			.setColor(12387078)
			.setImage('attachment://final.png');

		await channel
			.send({
				content: '<@' + member.id + '>',
				embeds: [embed],
				files: [image]
			})
			.then((message) => this.log(`Sent message: ${message.content}`))
			.catch(this.log);
	}
}

let instance: Welcomer;
export function welcomer() {
	if (!instance) instance = new Welcomer();

	return instance;
}

export default welcomer;

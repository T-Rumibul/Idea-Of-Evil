// import { Timer } from '../utils/Timer';

import { ChannelType } from 'discord-api-types/v9';
import { Guild, GuildMember, Message, PermissionFlagsBits, TextChannel } from 'discord.js';
import { IOEClient } from './IOEClient';
export interface Utils {
	isAdmin(member: GuildMember): Boolean;
}
export class Utils {
	private client: IOEClient;
	constructor(client: IOEClient) {
		this.client = client;
	}
	public isAdmin(member: GuildMember) {
		if (this.isOwner(member)) return true;
		if (member.permissions.has(PermissionFlagsBits.Administrator, true)) {
			return true;
		}
		const adminRoles: any[] = [];
		if (adminRoles.length > 0) {
			if (member.roles.cache.find((r) => adminRoles.indexOf(r.id) !== -1)) {
				return true;
			}
		}
		return false;
	}
	public isMod(member: GuildMember) {
		const modRoles: any[] = [];
		if (this.isAdmin(member)) return true;
		if (modRoles.length > 0) {
			if (member.roles.cache.find((r) => modRoles.indexOf(r.id) !== -1)) {
				return true;
			}
		}
	}
	public isOwner(member: GuildMember) {
		if (member.id === member.guild.ownerId) {
			return true;
		}
		return false;
	}
	public async getMemberFromMentions(mention: string, guild: Guild): Promise<GuildMember> {
		if (!mention) return;
		let usedID = mention.replace(/([^0-9])+/g, '');
		const member = await guild.members.fetch(usedID);
		return member;
	}
	public async getChannelFromMentions(mention: string, guild: Guild): Promise<TextChannel> {
		let channelID = mention.replace(/([^0-9])+/g, '');
		const channel = await guild.channels.fetch(channelID);
		if(channel.type !== ChannelType.GuildText) return null
		return channel;
	}
	public async deleteMessageTimeout(message: Message, timeout: number) {
		setTimeout(async () => {
			try {
				if (!message || message.channel.type !== ChannelType.GuildText) return;
				const msg = await message.channel.messages.cache.get(message.id)
				if(!msg) return;
				if (msg.deletable) {
					msg.delete()
				}
			} catch (e) {
				this.client.log('Message delete error:', e)
			}
		}, timeout)
	}
}

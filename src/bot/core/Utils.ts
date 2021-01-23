// import { Timer } from '../utils/Timer';

import { Guild, GuildChannel, GuildMember } from 'discord.js';
export interface Utils {}
export class Utils {
	public isAdmin(member: GuildMember, adminRoles?: string[]) {
		if (this.isOwner(member)) return true;
		if (member.hasPermission('ADMINISTRATOR')) {
			return true;
		}
		if (adminRoles.length > 0) {
			if (member.roles.cache.find((r) => adminRoles.indexOf(r.id) !== -1)) {
				return true;
			}
		}
		return false;
	}
	public isMod(member: GuildMember, modRoles: string[], adminRoles: string[]) {
		if (this.isAdmin(member, adminRoles)) return true;
		if (modRoles.length > 0) {
			if (member.roles.cache.find((r) => modRoles.indexOf(r.id) !== -1)) {
				return true;
			}
		}
	}
	public isOwner(member: GuildMember) {
		if (member.id === member.guild.ownerID) {
			return true;
		}
		return false;
	}
	public async getMemberFromMentions(mention: string, guild: Guild): Promise<GuildMember> {
		let usedID = mention.replace(/([^0-9])+/g, '');
		const member = await guild.members.fetch(usedID);
		return member;
	}
	public async getChannelFromMentions(mention: string, guild: Guild): Promise<GuildChannel> {
		let channelID = mention.replace(/([^0-9])+/g, '');
		const member = await guild.channels.cache.get(channelID);
		return member;
	}
}

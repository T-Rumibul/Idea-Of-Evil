import MessageEvent from '@bot/events/Message';
import GuildMemberAdd from '@bot/events/GuildMemberAdd';
import ReactionAdd from '@bot/events/ReactionAdd';
import PresenceUpdate from '@bot/events/PresenceUpdate';
import { ActivityType } from 'discord.js';
import type { GuildMember, Message } from 'discord.js';
import type { IOEClient } from '../IOEClient';

export class IOEClientEvents {
	constructor(private client: IOEClient) {}

	public init() {
		this.client.on('messageCreate', async (message: Message) => {
			MessageEvent(message, this.client);
		});

		this.client.on('guildMemberAdd', async (member: GuildMember) => {
			GuildMemberAdd(member, this.client);
		});

		this.client.on('presenceUpdate', async (oldPresence, newPresence) => {
			PresenceUpdate(oldPresence, newPresence, this.client);
		});

		this.client.on('messageReactionAdd', async (reaction, user) => {
			ReactionAdd(reaction, user, this.client);
		});

		this.client.on('shardError', (error) => {
			this.client.log('BOT', 'ShardError:', error);
		});
		this.client.on('ready', () => {
			if (this.client.user) {
				this.client.user.setActivity(`серверов: ${this.client.guilds.cache.size}`, {
					type: ActivityType.Listening,
				});
			}
			this.client.log('BOT', 'Bot is Ready!');
		});
	}
}

export default IOEClientEvents;

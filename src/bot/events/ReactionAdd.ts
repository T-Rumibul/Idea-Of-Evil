import { IOEClient } from '@bot/core/IOEClient';
import { MessageReaction, PartialMessageReaction, PartialUser, User } from 'discord.js';

export async function Emit(
	reaction: MessageReaction | PartialMessageReaction,
	user: User | PartialUser,
	client: IOEClient
) {
	await client.modules.Music.reactionHandler(reaction, user);
}

export default Emit;

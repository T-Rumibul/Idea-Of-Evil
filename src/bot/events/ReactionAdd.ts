import {IOEClient} from '@bot/core/IOEClient';
import {
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from 'discord.js';

export async function Emit(
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
  client: IOEClient
) {}

export default Emit;

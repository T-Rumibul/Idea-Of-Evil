import { IOEClient } from '@bot/core/IOEClient';
import { Message } from 'discord.js';
import { commands } from '@bot/modules/Commands';
const CommandHandler = commands();
export function Emit(Message: Message, client: IOEClient) {
	if (Message.author.bot) return;
	CommandHandler.parse(Message, client);
}

export default Emit;

import { IOEClient } from '@bot/core/IOEClient';
import type { Message } from 'discord.js';

export async function Emit(Message: Message, client: IOEClient) {
	if (Message.author.bot) return;
	try {
		await client.modules.music.play(Message);
	} catch (e) {
		client.log('', e);
	}
}

export default Emit;

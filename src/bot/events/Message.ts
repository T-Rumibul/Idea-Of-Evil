import { IOEClient } from '@bot/core/IOEClient';
import { Message } from 'discord.js';

export async function Emit(Message: Message, client: IOEClient) {
    
    if (Message.author.bot) return;
    await client.modules.Player.searchAndPlayOrAddToQueue(Message)
}

export default Emit;

import { IOEClient } from '@bot/core/IOEClient';
import { Message } from 'discord.js';

export async function Emit(Message: Message, client: IOEClient) {
    
    if (Message.author.bot) return;
    try {
       
        await client.modules.Player.play(Message)
    } catch(e) {
        console.log(e)
    }
}

export default Emit;

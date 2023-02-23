import { ChannelType, GuildMember } from 'discord.js';
import { CustomArgs } from '@bot/modules/Commands';
export const ownerOnly = true;
export const exec = async (caller: GuildMember, args: string[], { Message, Client }: CustomArgs) => {
    if(caller.user.id !== "231449604711907328" && !args[0]) return;
    // For type safety
	if (Message.channel.type !== ChannelType.GuildText) return;
    if(!args[0] && !args[1]) {
       let msg = await Message.channel.send('Укажите ID и причину');
       Client.utils.deleteMessageTimeout(msg, 5000)
       return;
    }
    
    await Client.blackListUser(args[0], args[1]);
    let msg = await Message.channel.send(`Пользователь с ID:${args[0]} добавлен в черный список.`);
    Client.utils.deleteMessageTimeout(msg, 5000)
    


 };

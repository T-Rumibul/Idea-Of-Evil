import { GuildMember, TextChannel } from 'discord.js';
import { CustomArgs } from '@bot/modules/Commands';
export const adminOnly = true;
export const builder = ['set'];
export const exec = async (caller: GuildMember, args: string[], { Message, Client }: CustomArgs) => {
    if (!args[0]) return;
    const channel: TextChannel = await Client.utils.getChannelFromMentions(args[0], caller.guild);
    if (!channel) return;
    if (channel.type !== "GUILD_TEXT") return;

    if ((await channel.messages.fetch({}, {
        cache: true
    })).size > 0) {
        const msg = await Message.channel.send(
            `В канале присутствуют сообщения, создайте новый или удалите их.`
        );
        Client.utils.deleteMessageTimeout(msg, 5000);
        return;
    }
    Client.setMusicChannel(caller.guild.id, channel.id)
    const msg = await Message.channel.send(
        `Новый канал для плеера: <#${(await Client.getMusicChannels()).get(caller.guild.id)}>`
    );
    Client.utils.deleteMessageTimeout(msg, 5000);
    
    Client.modules.Player.sendControllMessage(channel, caller.guild.id);
};

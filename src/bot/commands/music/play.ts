import { GuildMember } from 'discord.js';
import { args as Args } from 'discord-cmd-parser';
import { CustomArgs } from '@bot/modules/Commands';
import { joinVoiceChannel, createAudioResource, createAudioPlayer, AudioPlayerStatus, StreamType } from '@discordjs/voice';
import ytdl from 'ytdl-core';
export const exec = async (caller: GuildMember, args: Args, { Message, Client }: CustomArgs) => {
    if (caller.voice.channel == null) {
        const msg = await Message.channel.send('Вы должны находится в голосовом канале.')
        Client.utils.deleteMessageTimeout(msg, 5000);
        return;
    }
    const link = await Client.modules.Player.searchTrack(Message.content);
    if (link.length == 0) {
        const msg = await Message.channel.send('Трек не найден.')
        Client.utils.deleteMessageTimeout(msg, 5000);
        return;
    }
    const connection = joinVoiceChannel({
        channelId: caller.voice.channel.id,
        guildId: caller.guild.id,
        adapterCreator: caller.guild.voiceAdapterCreator 
    })

    const stream = ytdl(link[0].link, { filter: 'audioonly' });
    const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
    const player = createAudioPlayer();

    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => connection.destroy());
   
};

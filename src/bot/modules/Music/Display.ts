import type IOEClient from '@bot/core/IOEClient';
import {TextChannel, EmbedBuilder, ChannelType} from 'discord.js';
import type {Music} from '../Music';

type EmbedField = {
  name: string;
  value: string;
  inline: true;
};
const embedTemplate = {
  title: '',
  description: '',
  url: '',
  color: 8340425,
  image: {
    url: 'https://media.discordapp.net/attachments/716045712583950376/1233671883854188576/Nt6v.gif?ex=662df1f9&is=662ca079&hm=a59076687a8923c4b6583020997110dac20a1564c1d3764cf766d12dab1feab6&=&width=825&height=511',
  },
  author: {
    name: 'Сейчас проигрывается:',
    url: '',
  },
  fields: <EmbedField[]>[],
};

export class MusicDisplay {
  constructor(
    private music: Music,
    private client: IOEClient
  ) {}
  async subscribeToEvents() {
    this.music.queue.on('setGuildQueue', async guildId => {
      this.updateDisplayMessage(guildId);
    });
  }
  async sendDisplayMessage(channel: TextChannel, guildId: string) {
    const msg = this.music.playerDisplayMessages.get(guildId);
    if (msg && msg.deletable) msg.delete();
    if (
      (
        await channel.messages.fetch({
          cache: true,
        })
      ).size > 0
    )
      try {
        await channel.bulkDelete(
          (
            await channel.messages.fetch({
              cache: true,
            })
          ).size
        );
      } catch (err) {
        this.client.log('MUSIC', 'Error in message bulk delete', err);
        await channel.send(
          '⚠ **Удалите старые сообщения вручную или выберите другой канал для музыкального модуля**'
        );
        await this.client.IOE.externalDB.guild.deleteMusicChannel(guildId);
        await this.music.updateMusicChannels();
        return;
      }
    const embed = new EmbedBuilder(embedTemplate);
    const displayMessage = await channel.send({
      embeds: [embed],
    });
    this.music.playerDisplayMessages.set(guildId, displayMessage);
    this.updateDisplayMessage(guildId);
    await this.subscribeToEvents();
  }

  async updateDisplayMessage(guildId: string) {
    const msg = this.music.playerDisplayMessages.get(guildId);
    if (!msg || !msg.editable) {
      this.music.channels.forEach(
        async (channelId: string, IguildId: string) => {
          if (IguildId === guildId) {
            const guild = await this.client.guilds.fetch(guildId);
            if (!guild) return;
            const channel = await guild.channels.fetch(channelId);

            if (channel && channel.type === ChannelType.GuildText) {
              await this.sendDisplayMessage(channel, guildId);
              await this.updateDisplayMessage(guildId);
            }
          }
        }
      );
      return;
    }

    const newEmbed = JSON.parse(JSON.stringify(embedTemplate));
    const queue = await this.music.queue.getGuildQueue(guildId);
    if (queue.length === 0) {
      const empty = new EmbedBuilder();
      empty.setImage(
        'https://media.discordapp.net/attachments/716045712583950376/1233671796314869770/f57f4e47c4faab3ea7b357a85910a80b.gif?ex=662df1e4&is=662ca064&hm=cd0f5687bf9ac723fea38c86f2a282852ef532278e137d32cd8f0f522425bcf9&=&width=542&height=515'
      );
      empty.setTitle(
        'Загрузите аудио/видео файл, предоставьте ссылку на YouTube/Spotify, или введите текстовый запрос для поиска на YouTube.'
      );
      const newMsg = await msg.edit({
        embeds: [empty],
      });
      this.music.playerDisplayMessages.set(guildId, newMsg);
      return;
    }
    for (let i = 0; i < queue.length; i += 1) {
      const song = queue[i];
      if (!song) break;
      if (i === 0) {
        newEmbed.title = `[${song.duration}] ${song.title}`;
        if (song.repeat) newEmbed.title = `🔁 ${newEmbed.title}`;

        newEmbed.url = song.link;
        // newEmbed.image.url = song.thumbnail;
      }
      if (i < 11 && i > 0) {
        newEmbed.description += `${i}. **[[${song.duration}] ${song.title}](${song.link})** \n`;
      } else if (i >= 11) {
        newEmbed.fields[0] = {
          name: '\u200B',
          value: '\u200B',
          inline: true,
        };
        newEmbed.fields[0].value = ` ...Еще ${queue.length - i}`;
        break;
      }
    }

    const newMsg = await msg.edit({
      embeds: [newEmbed],
    });

    this.music.playerDisplayMessages.set(guildId, newMsg);
  }
}

export default MusicDisplay;

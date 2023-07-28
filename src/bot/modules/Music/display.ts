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
    url: '',
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

  async sendDisplayMessage(channel: TextChannel, guildId: string) {
    const msg = this.music.playerDisplayMessages.get(guildId);
    if (msg && msg.channelId === channel.id) return;
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
    await this.music.controls.initControlls(guildId);
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
    const queue = await this.music.queue.getQueue(guildId);
    if (queue.length === 0) {
      const newMsg = await msg.edit({
        embeds: [newEmbed],
      });
      this.music.playerDisplayMessages.set(guildId, newMsg);
    }
    for (let i = 0; i < queue.length; i += 1) {
      const song = queue[i];
      if (!song) break;
      if (i === 0) {
        newEmbed.title = `[${song.duration}] ${song.title}`;
        if (song.repeat) newEmbed.title = `🔁 ${newEmbed.title}`;

        newEmbed.url = song.link;
        newEmbed.image.url = song.thumbnail;
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

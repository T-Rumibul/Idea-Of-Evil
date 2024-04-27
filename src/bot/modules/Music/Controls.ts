import type IOEClient from '@bot/core/IOEClient';
import {getVoiceConnection, AudioPlayerStatus} from '@discordjs/voice';
import {
  type MessageReaction,
  type PartialMessageReaction,
  type User,
  type PartialUser,
  ButtonBuilder,
  ButtonStyle,
  Interaction,
  ActionRowBuilder,
  ButtonInteraction,
  Message,
  InteractionResponse,
} from 'discord.js';
import type {Music} from '../Music';

const togglePause = new ButtonBuilder()
  .setCustomId('togglePause')
  .setEmoji(':Play:1233628592995565620')
  .setStyle(ButtonStyle.Primary);

const stop = new ButtonBuilder()
  .setCustomId('stop')
  .setLabel('Stop')
  .setStyle(ButtonStyle.Danger);

const next = new ButtonBuilder()
  .setCustomId('next')
  .setLabel('Next')
  .setStyle(ButtonStyle.Primary);

const repeat = new ButtonBuilder()
  .setCustomId('repeat')
  .setLabel('Repeat')
  .setStyle(ButtonStyle.Primary);

const shuffle = new ButtonBuilder()
  .setCustomId('shuffle')
  .setLabel('Shuffle')
  .setStyle(ButtonStyle.Primary);
const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
  togglePause,
  stop,
  next,
  repeat,
  shuffle
);

export class MusicControls {
  interactionTimeout = new Set();
  constructor(
    private music: Music,
    private client: IOEClient
  ) {}

  async initControlls(guildId: string) {
    try {
      const msg = this.music.playerDisplayMessages.get(guildId);
      if (!msg) return;

      msg?.channel.send({
        content: '',
        components: [row],
      });
    } catch (e) {
      this.music.log('Controls:', e);
    }
  }
  async interactionHandler(interaction: ButtonInteraction) {
    try {
      const id = interaction.customId;
      const guildId = interaction.guildId!;

      if (this.interactionTimeout.has(guildId)) {
        const warning = await interaction.channel?.send({
          embeds: [
            {
              description:
                '❌ **Пожалуйста, дождитесь 1 секунды перед следующим нажатием кнопки. Нажимайте кнопку менее часто, пожалуйста.**',
              color: 8340425,
            },
          ],
        });
        setTimeout(() => warning?.delete(), 1500);
        return;
      }
      this.interactionTimeout.add(guildId);
      const player = await this.music.player.get(guildId);

      setTimeout(() => {
        this.interactionTimeout.delete(guildId);
        if (!interaction.replied) interaction.update({});
      }, 1000);
      if (!player) return;

      switch (id) {
        // Resume
        case 'togglePause': {
          if (player.state.status === 'playing') player.pause();
          else player.unpause();
          break;
        }
        // Stop
        case 'stop': {
          this.music.player.stop(guildId);
          break;
        }
        // Next
        case 'next':
          await this.music.queue.nextSong(guildId, true);
          break;
        // Repeat
        case 'repeat': {
          const enabled = await this.music.queue.toggleRepeatFirst(guildId);
          repeat.setStyle(enabled ? ButtonStyle.Success : ButtonStyle.Primary);
          interaction.update({
            components: [row],
          });
          break;
        }
        default:
          break;
      }
    } catch (e) {
      this.music.log('Controls:', e);
    }
  }
}

export default MusicControls;

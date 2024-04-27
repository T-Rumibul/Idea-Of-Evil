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
} from 'discord.js';
import type {Music} from '../Music';

export class MusicControls {
  constructor(
    private music: Music,
    private client: IOEClient
  ) {}

  async initControlls(guildId: string) {
    const msg = this.music.playerDisplayMessages.get(guildId);
    if (!msg) return;

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

    msg?.channel.send({
      content: '',
      components: [row],
    });
  }
  async interactionHandler(interaction: ButtonInteraction) {
    try {
      const id = interaction.customId;
      const guildId = interaction.guildId!;
      const player = await this.music.player.get(guildId);

      if (!player) return;

      switch (id) {
        // Resume
        case 'togglePause': {
          if (player.state.status === 'playing') player.pause();
          else player.unpause();
          interaction.update({});
          break;
        }
        // Pause
        case 'pause':
          player.pause(true);
          interaction.update({});
          break;
        // Stop
        case 'stop': {
          const connection = getVoiceConnection(guildId);
          if (connection) connection.destroy();

          player?.stop(true);
          await this.music.queue.clearQueue(guildId || '');

          await this.music.display.updateDisplayMessage(guildId);
          interaction.update({});
          break;
        }
        // Next
        case 'next':
          await this.music.queue.nextSong(guildId, true);
          interaction.update({});
          break;
        // Repeat
        case 'repeat': {
          await this.music.queue.toggleRepeatFirst(guildId);
          await this.music.display.updateDisplayMessage(guildId);
          interaction.update({});
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

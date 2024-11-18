import type IOEClient from '@bot/core/IOEClient';
import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  DiscordGatewayAdapterCreator,
  getVoiceConnection,
  joinVoiceChannel,
  NoSubscriberBehavior,
  StreamType,
} from '@discordjs/voice';
import EventEmitter from 'events';

import type {Music} from '../Music';
import ytdl from './Ytdl';

export class MusicPlayer extends EventEmitter {
  players: Map<string, AudioPlayer> = new Map();

  constructor(
    private music: Music,
    private client: IOEClient
  ) {
    super();
  }

  async connect(
    guildId: string,
    channelId: string,
    voiceAdapterCreator: DiscordGatewayAdapterCreator
  ) {
    try {
      let connection = getVoiceConnection(guildId);
      if (!connection) {
        connection = joinVoiceChannel({
          channelId,
          guildId,
          adapterCreator: voiceAdapterCreator,
        });
      }
      return connection;
    } catch (e) {
      this.music.log('Player:', e);
      return;
    }
  }

  async start(
    guildId: string,
    channelId: string,
    voiceAdapterCreator: DiscordGatewayAdapterCreator
  ) {
    try {
      const connection = await this.connect(
        guildId,
        channelId,
        voiceAdapterCreator
      );
      if (!connection) return;

      const player = await this.get(guildId);
      if (!player) return;

      if (player.state.status === AudioPlayerStatus.Paused) {
        connection.subscribe(player);
        player.unpause();
        return;
      }

      const playing = await this.play(player, guildId);
      if (!playing) return;
      connection.subscribe(player);
    } catch (e) {
      this.music.log('Player:', e);
    }
  }

  async stop(guildId: string) {
    try {
      const player = await this.get(guildId);
      if (!player) return;

      player.stop(true);
      const connection = getVoiceConnection(guildId);
      if (connection) connection.destroy();
      this.music.queue.clear(guildId);
      this.emit('stop', guildId);
    } catch (e) {
      this.music.log('Player:', e);
    }
  }

  private async play(player: AudioPlayer, guildId: string) {
    try {
      const queue = await this.music.queue.get(guildId);

      if (queue.length === 0) return false;

      const url = queue[0]?.link;
      if (!url) return false;
      let stream;
      let resource;
      if (queue[0].attachment) {
        resource = createAudioResource(url, {
          inputType: StreamType.Arbitrary,
          inlineVolume: true,
        });
      } else {
        stream = await ytdl.stream(url, {
          discordPlayerCompatibility: true,
        });
        resource = createAudioResource(stream.stream, {
          inputType: stream.type,
        });
      }

      player.play(resource);

      player.unpause();
      return true;
    } catch (e) {
      this.music.log('Player', e);
      return false;
    }
  }

  async next(guildId: string) {
    try {
      const connection = getVoiceConnection(guildId);
      const player = await this.get(guildId);
      if (!player) return;
      if (!connection) return;

      const playing = await this.play(player, guildId);
      if (!playing) return;
      connection.subscribe(player);
    } catch (e) {
      this.music.log('Player:', e);
    }
  }

  async isPlaying(guildId: string) {
    try {
      if (this.players.has(guildId)) {
        const player = this.players.get(guildId);

        if (
          player?.state.status === AudioPlayerStatus.Playing ||
          player?.state.status === AudioPlayerStatus.Paused
        )
          return true;
      }
      return false;
    } catch (e) {
      this.music.log('Player:', e);
      return false;
    }
  }

  async get(guildId: string) {
    try {
      if (this.players.has(guildId)) return this.players.get(guildId)!;

      const player = await this.create(guildId);

      return player;
    } catch (e) {
      this.music.log('Player:', e);
      return;
    }
  }

  private async create(guildId: string) {
    try {
      const player = createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Pause,
        },
      });
      this.addEventListeners(player, guildId);
      this.players.set(guildId, player);
      return player;
    } catch (e) {
      this.music.log('Player:', e);
      return;
    }
  }

  private async addEventListeners(player: AudioPlayer, guildId: string) {
    try {
      player.on(AudioPlayerStatus.Idle, async () => {
        this.emit('idle', [player, guildId]);
      });
      player.on('error', e => {
        this.emit('error', [player, guildId, e]);
      });
    } catch (e) {
      this.music.log('Player:', e);
    }
  }
}

export default MusicPlayer;

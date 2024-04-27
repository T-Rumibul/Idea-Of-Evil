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
import ytdl from './ytdl';

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
    let connection = getVoiceConnection(guildId);
    if (!connection) {
      connection = joinVoiceChannel({
        channelId,
        guildId,
        adapterCreator: voiceAdapterCreator,
      });
    }
    return connection;
  }

  async start(
    guildId: string,
    channelId: string,
    voiceAdapterCreator: DiscordGatewayAdapterCreator
  ) {
    const connection = await this.connect(
      guildId,
      channelId,
      voiceAdapterCreator
    );
    const player = await this.get(guildId);

    if (player.state.status === AudioPlayerStatus.Paused) {
      connection.subscribe(player);
      player.unpause();
      return;
    }

    const playing = await this.play(player, guildId);
    if (!playing) return;
    connection.subscribe(player);
  }

  async stop(guildId: string) {
    const player = await this.get(guildId);
    player.stop(true);
    const connection = getVoiceConnection(guildId);
    if (connection) connection.destroy();
  }

  private async play(player: AudioPlayer, guildId: string) {
    try {
      const queue = await this.music.queue.getGuildQueue(guildId);

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
        stream = await ytdl.stream(url);
        resource = createAudioResource(stream.stream, {
          inputType: stream.type,
        });
      }

      player.play(resource);

      player.unpause();
      return true;
    } catch (e) {
      this.music.log(`Play error GUILD: ${guildId}`, e);
      return false;
    }
  }

  async next(guildId: string) {
    const connection = getVoiceConnection(guildId);
    const player = await this.get(guildId);
    if (!connection) return;
    const playing = await this.play(player, guildId);
    if (!playing) return;
    connection.subscribe(player);
  }

  async isPlaying(guildId: string) {
    if (this.players.has(guildId)) {
      const player = this.players.get(guildId);

      if (
        player?.state.status === AudioPlayerStatus.Playing ||
        player?.state.status === AudioPlayerStatus.Paused
      )
        return true;
    }
    return false;
  }

  async get(guildId: string) {
    if (this.players.has(guildId)) return this.players.get(guildId)!;

    const player = await this.create(guildId);

    return player;
  }

  private async create(guildId: string) {
    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
      },
    });
    this.addEventListeners(player, guildId);
    this.players.set(guildId, player);
    return player;
  }

  private async addEventListeners(player: AudioPlayer, guildId: string) {
    player.on(AudioPlayerStatus.Idle, async () => {
      this.emit('idle', [player, guildId]);
    });
    player.on('error', e => {
      this.emit('error', [player, guildId, e]);
    });
  }
}

export default MusicPlayer;

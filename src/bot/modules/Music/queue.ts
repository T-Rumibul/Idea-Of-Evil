import dbLocal from '@bot/core/DataBase/local';
import IOEClient from '@bot/core/IOEClient';
import EventEmitter from 'events';
import type {Music} from '../Music';

export type Song = {
  title: string;
  link: string;
  repeat: boolean;
  duration: string;
  thumbnail: string;
  attachment?: boolean;
};
export type Queue = {
  [key: string]: Song[];
};
const db = dbLocal();

export class MusicQueue extends EventEmitter {
  constructor(
    private music: Music,
    private client: IOEClient
  ) {
    super();
  }

  async getQueue() {
    try {
      if (!(await db.has('queue'))) db.push('queue', {});
      const queue = await db.get<Queue>('queue');

      return queue;
    } catch (e) {
      this.music.log('Queue:', e);
      return {};
    }
  }
  async getGuildQueue(guildId: string) {
    try {
      const queue = await this.getQueue();
      if (!queue[guildId]) await this.setGuildQueue(guildId, []);
      return queue[guildId];
    } catch (e) {
      this.music.log('Queue:', e);
      return [];
    }
  }
  async setGuildQueue(guildId: string, songs: Song[]) {
    try {
      const queue = await this.getQueue();

      queue[guildId] = songs;
      db.push('queue', queue);
      this.emit('set');
    } catch (e) {
      this.music.log('Queue:', e);
    }
  }

  async clearQueue(guildId: string) {
    try {
      if (await db.has('queue')) {
        const queue = await this.getQueue();
        queue[guildId] = [];
        db.push('queue', queue);
        this.emit('clear');
        return true;
      }
      return false;
    } catch (e) {
      this.music.log('Queue:', e);
      return false;
    }
  }

  async addToQueue(song: Song, guildId: string) {
    try {
      const guildQueue: Song[] = await this.getGuildQueue(guildId);

      guildQueue.push(song);
      this.setGuildQueue(guildId, guildQueue);

      this.emit('add');
    } catch (e) {
      this.music.log('Queue:', e);
    }
  }

  async removeFirst(guildId: string) {
    try {
      const guildQueue = await this.getGuildQueue(guildId);

      guildQueue.shift();
      this.setGuildQueue(guildId, guildQueue);

      this.emit('remove');
    } catch (e) {
      this.music.log('Queue:', e);
    }
  }

  async nextSong(guildId: string, force?: boolean) {
    try {
      const queue = await this.getGuildQueue(guildId);
      if (queue.length === 0) {
        this.emit('empty', [guildId]);
        return;
      }
      if (!queue[0].repeat || force) {
        await this.removeFirst(guildId);
      }

      this.emit('nextSong', [queue, guildId]);
    } catch (e) {
      this.music.log('Queue:', e);
    }
  }

  async toggleRepeatFirst(guildId: string) {
    try {
      const guildQueue = await this.getGuildQueue(guildId);
      if (!guildQueue[0]) return;
      guildQueue[0].repeat = !guildQueue[0].repeat;
      await this.setGuildQueue(guildId, guildQueue);
    } catch (e) {
      this.music.log('Queue:', e);
    }
  }

  async shuffleGuildQueue(guildid: string) {
    try {
      const guildQueue = await this.getGuildQueue(guildid);

      // We need at least 2 songs except from currently playing to shuffle
      if (guildQueue.length < 3) return;
      const currentlyPlaying = <Song>guildQueue.shift();
      const shuffled = this.client.IOE.utils.shuffle(guildQueue);
      shuffled.unshift(currentlyPlaying);
      this.setGuildQueue(guildid, shuffled);
      this.emit('shuffle');
    } catch (e) {
      this.music.log('Queue:', e);
    }
  }
}

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
export type Queue = Map<string, Song[]>

export class MusicQueue extends EventEmitter {
  constructor(
    private music: Music,
    private client: IOEClient,
    private queue: Queue = new Map()
  ) {
    super();
  }

  get(guildID: string) {
    try {
      
      return this.queue.get(guildID) || this.set(guildID, []);
    } catch (e) {
      this.music.log('MusicQueue errot at get:', e);
      return [];
    }
  }
  set(guildID: string, songs: Song[]) {
    try {
    
      this.queue.set(guildID, songs)
      this.emit('setGuildQueue', guildID);
      return songs;
    } catch (e) {
      this.music.log('MusicQueue errot at set:', e);
      return []
    }
  }

  clear(guildID: string) {
    try {
      this.set(guildID, []);
      this.emit('clear');
      return true;
    } catch (e) {
      this.music.log('MusicQueue errot at clearQueue:', e);
      return false;
    }
  }

  add(song: Song, guildID: string) {
    try {
      const queue: Song[] = this.get(guildID);

      queue.push(song);

      this.set(guildID, queue);

      this.emit('add');
    } catch (e) {
      this.music.log('MusicQueue errot at addToQueue:', e);
    }
  }

  removeFirst(guildID: string) {
    try {
      const queue = this.get(guildID);

      queue.shift();
      this.set(guildID,queue);
    } catch (e) {
      this.music.log('MusicQueue errot at removeFirst:', e);
    }
  }

  nextSong(guildID: string, force?: boolean) {
    try {
      const queue = this.get(guildID);

      if (!queue[0]?.repeat || force) {
        this.removeFirst(guildID);
      }
      if (queue.length === 0) {
        this.emit('empty', [guildID]);
        return;
      }
      this.emit('nextSong', [queue, guildID]);
    } catch (e) {
      this.music.log('MusicQueue errot at nextSong:', e);
    }
  }

  toggleRepeat(guildID: string) {
    try {
      const queue = this.get(guildID);
      if (!queue[0]) return;
      queue[0].repeat = !queue[0].repeat;
      this.set(guildID, queue);
      return queue[0].repeat;
    } catch (e) {
      this.music.log('MusicQueue errot at toogleRepeat:', e);
      return false;
    }
  }

  shuffle(guildID: string) {
    try {
      const queue = this.get(guildID);

      // We need at least 2 songs except from currently playing to shuffle
      if (queue.length < 3) return;
      const currentlyPlaying = <Song>queue.shift();
      const shuffled = this.client.IOE.utils.shuffle(queue);
      shuffled.unshift(currentlyPlaying);
      this.set(guildID, shuffled);
      this.emit('shuffle');
    } catch (e) {
      this.music.log('MusicQueue errot at shuffleQueue:', e);
    }
  }
}

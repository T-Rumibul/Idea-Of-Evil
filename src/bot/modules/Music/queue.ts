import dbLocal from '@bot/core/DataBase/local';
import IOEClient from '@bot/core/IOEClient';
import { getVoiceConnection } from '@discordjs/voice';
import EventEmitter from 'events';
import type { Music } from '../Music';

export type Song = {
	title: string;
	link: string;
	repeat: boolean;
	duration: string;
	thumbnail: string;
};
export type Queue = {
	[key: string]: Song[];
};
const db = dbLocal();

export class MusicQueue extends EventEmitter {
	constructor(private music: Music, private client: IOEClient) {
		super();
	}

	async getQueue(guildId: string) {
		if (await db.has('queue')) {
			const queue = await db.get<Queue>('queue');
			if (!queue[guildId]) {
				queue[guildId] = [];
				db.push('queue', queue);
				return queue[guildId] || [];
			}
			return queue[guildId] || [];
		}
		const queue: Queue = {};
		queue[guildId] = [];
		db.push('queue', queue);
		return queue[guildId] || [];
	}

	async setQueue(guildId: string, songs: Song[]) {
		await this.getQueue(guildId);
		const queue = await db.get<Queue>('queue');
		queue[guildId] = songs;
		db.push('queue', queue);
		this.emit('set');
		return queue[guildId];
	}

	async clearQueue(guildId: string) {
		if (await db.has('queue')) {
			const queue = await db.get<Queue>('queue');
			queue[guildId] = [];
			db.push('queue', queue);
			this.emit('clear');
			return true;
		}
		return false;
	}

	async addToQueue(song: Song, guildId: string) {
		let queue: Queue = {};
		if (await db.has('queue')) queue = await db.get<Queue>('queue');
		const guildQueue = queue[guildId];
		if (guildQueue) {
			guildQueue.push(song);
			queue[guildId] = guildQueue;
			db.push('queue', queue);
		} else {
			queue[guildId] = [song];
			db.push('queue', queue);
		}
		this.emit('add');
	}

	async removeFromQueue(guildId: string) {
		let queue: Queue = {};
		if (await db.has('queue')) queue = await db.get<Queue>('queue');
		const guildQueue = queue[guildId];
		if (guildQueue) {
			guildQueue.shift();
			queue[guildId] = guildQueue;
		}
		this.emit('remove');
	}

	/** This code shuffles the elements of an array by iterating over the array backwards,
	 *  and for each element in the array, selecting a random index between 0 and the current index,
	 * and swapping the element at the current index with the element at the randomly selected index. T
	 * he result is that the array is randomly shuffled. */

	async shuffle(inputArray: Song[]) {
		try {
			const a = inputArray;
			if (a.length === 0) return a;
			// Iterate over the array backwards, starting at the last element
			for (let i = a.length - 1; i > 0; i -= 1) {
				// Generate a random index between 0 and the current index
				const j = Math.floor(Math.random() * (i + 1));

				// Swap the current element with a randomly selected element
				const temp = a[i]!;
				a[i] = a[j]!;
				a[j] = temp;
			}
			this.emit('shuffle');
			return a;
		} catch (e) {
			this.music.log(`Shuffle Error:`, e);
			return inputArray;
		}
	}

	async nextSong(guildId: string, force?: boolean) {
		const queue = await this.getQueue(guildId);

		if ((queue[0] && !queue[0].repeat) || force) {
			queue.shift();
			await this.setQueue(guildId, queue);
		}
		this.emit('nextSong', [queue, guildId]);
	}
}

import dbLocal from '@bot/core/DataBase/local';

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

export async function getQueue(guildId: string) {
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

export async function setQueue(guildId: string, songs: Song[]) {
	await getQueue(guildId);
	const queue = await db.get<Queue>('queue');
	queue[guildId] = songs;
	db.push('queue', queue);
	return queue[guildId];
}

export async function clearQueue(guildId: string) {
	if (await db.has('queue')) {
		const queue = await db.get<Queue>('queue');
		queue[guildId] = [];
		db.push('queue', queue);
		return true;
	}
	return false;
}

export async function addToQueue(song: Song, guildId: string) {
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
}

export async function removeFromQueue(guildId: string) {
	let queue: Queue = {};
	if (await db.has('queue')) queue = await db.get<Queue>('queue');
	const guildQueue = queue[guildId];
	if (guildQueue) {
		guildQueue.shift();
		queue[guildId] = guildQueue;
	}
}

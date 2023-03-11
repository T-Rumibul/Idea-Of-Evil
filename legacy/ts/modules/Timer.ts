// import uniqid from 'uniqid';
// import { Collection } from 'discord.js';
// import { IOEClientEventEmmiter } from '@bot/core/EventEmmtter';

// export class Timer {
// 	private _list: Collection<string, TimerIns>;

// 	constructor() {
// 		this._list = new Collection();
// 	}

// 	public add(duration: number) {
// 		const timer = new TimerIns(duration);
// 		this._list.set(timer.id, timer);
// 		timer.start();
// 		return timer;
// 	}

// 	get list() {
// 		return this._list;
// 	}
// }
// class TimerIns extends IOEClientEventEmmiter {
// 	private _duration: number;
// 	private _isEnded: boolean;
// 	private _isStarted: boolean;
// 	private _id: string;
// 	private _endTime: number;
// 	constructor(duration: number) {
// 		super();
// 		this._duration = duration;
// 		this._isEnded = false;
// 		this._isStarted = false;
// 		this._id = uniqid();
// 	}
// 	get isStarted() {
// 		return this._isStarted;
// 	}
// 	get isEnded() {
// 		return this._isEnded;
// 	}
// 	get id() {
// 		return this._id;
// 	}
// 	get duration() {
// 		return this._duration;
// 	}

// 	public start(): Promise<void> {
// 		if (this._isStarted) return;
// 		if (this._isEnded) return;
// 		this._isStarted = true;
// 		this._endTime = Date.now() + this._duration;
// 		this.emit('start', this);
// 		return this._countDown();
// 	}
// 	public destroy(): void {
// 		if (this._isEnded) return;
// 		this._isEnded = true;
// 		this.emit('end', this);
// 	}

// 	private _countDown(): Promise<void> {
// 		return new Promise((resolve) => {
// 			const updater = setInterval(() => {
// 				if (this._endTime <= Date.now()) {
// 					this._duration = 0;
// 					resolve();
// 					this.emit('end', this);
// 					clearInterval(updater);
// 				}
// 				this._duration = this._endTime - Date.now();
// 				this.emit('tick', this);
// 			}, 1000);
// 		});
// 	}
// }

import { createHandler, CommandHandler } from 'command-handler-discord';
import { Message } from 'discord.js';
import { readdirSync } from 'fs';
import path from 'path';
import { IOEClient } from '@bot/core/IOEClient';
import { BaseModule } from '@bot/core/BaseModule';
const COMMANDS_PATH = path.join(__dirname, '../commands');
const NAME = 'Commands';
export interface CustomArgs {
	Message: Message;
	Client: IOEClient;
}
export class Commands extends BaseModule {
	private CAT_NAMES: string[];
	private PARSER: CommandHandler;
	private client: IOEClient;
	constructor(client: IOEClient) {
		super(NAME);
		this.client = client;
		this.init();
	}
	public get Parser() {
		return this.PARSER;
	}
	private async init() {
		this.log('Initialization');
		this.CAT_NAMES = readdirSync(COMMANDS_PATH, { withFileTypes: true })
			.filter((dirent) => dirent.isDirectory())
			.map((dirent) => dirent.name);
		const catPaths: Array<string> = [];

		this.CAT_NAMES.forEach((name) => {
			catPaths.push(path.join(COMMANDS_PATH, name));
		});

		this.PARSER = createHandler(catPaths, {
			quotesType: '"',
			useQuotes: true,
		});
		this.registerEvents();
		this.log('Initialization Completed');
		
	}
	private registerEvents() {
		this.client.on('messageCreate', async (message: Message) => {
			if (message.author.bot) return;
			const musicChannels = await this.client.getMusicChannels()
			if (message.channelId === musicChannels.get(message.guildId)) return;
			this.parse(message);
		});
	}
	async parse(message: Message) {
		const prefix = await this.client.getPrefix(message.guild.id)
		let mContent = message.content
		if (mContent.startsWith(`<@${this.client.user.id}`)) {
			mContent = mContent.replace(/(<@(!?)+\d+>\s)|(<@(!?)+\d+>)/, prefix);
		}
		try {
			
			let parseResult = await this.PARSER.command(prefix, mContent);
			if (!parseResult) return;

			const { cmd, exist, exec } = parseResult;
			this.client.utils.deleteMessageTimeout(message, 2000)
			if((await this.client.checkBlackListUser(message.author.id)) != null) {
				const msg = await message.channel.send(`<@${message.author.id}> Вы внесены в черный список и не можете использовать команды этого бота. \n Причина: ${await this.client.checkBlackListUser(message.author.id)}`);
				this.client.utils.deleteMessageTimeout(msg, 10000)
				return
			}
			if (cmd.adminOnly && !this.client.utils.isAdmin(message.member)) {
				await message.channel.send(`Недостаточно прав для использования этой команды!`);
				return;
			}
			if (cmd.ownerOnly && !this.client.utils.isOwner(message.member)) {
				await message.channel.send(`Недостаточно прав для использования этой команды!`);
				return;
			}
			if (cmd.moderOnly && !this.client.utils.isMod(message.member)) {
				await message.channel.send(`Недостаточно прав для использования этой команды!`);
				return;
			}
			
			exec(message.member, {
				Message: message,
				Client: this.client,
			});
		} catch (e) {
			console.log(typeof e === 'string' && e == 'Command not found.');
			if (typeof e === 'string' && e == 'Command not found.') return;
			this.log('Error: %O', e);
		}
	}
}

let instance: Commands;
export function commands(client: IOEClient) {
	if (!instance) instance = new Commands(client);

	return instance;
}

export default commands;

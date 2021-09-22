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
			quotesType: "'",
			prefix: '&',
		});
		this.log('Initialization Completed');
		this.registerEvents();
	}
	private registerEvents() {
		this.client.on('messageCreate', async (message: Message) => {
			if (message.author.bot) return;
			const prefix = await this.client.getPrefix(message.guild.id);
			this.PARSER.setPrefix(prefix);
			this.parse(message);
		});
	}
	async parse(message: Message) {
		console.log(message.content)
		if (message.content.startsWith(`<@!${this.client.user.id}`)) {
			message.content = message.content.replace(/(<@(!?)+\d+>)/, this.PARSER.Prefix);
		}
		try {
			let parseResult = await this.PARSER.command(message.content);
			if (!parseResult) return;

			const { cmd, exec } = parseResult;
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
			this.log('%O', cmd);
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

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
	constructor() {
		super(NAME);
		this.init();
	}
	public get Parser() {
		return this.PARSER;
	}
	private init() {
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
		});
		this.log('Initialization Completed');
		this.log(`Commands: %O`, this.PARSER.Commands);
	}
	async parse(message: Message, client: IOEClient) {
		if (message.content.startsWith('<@!')) {
			message.content = message.content.replace(/(<@(!?)+\d+>)/, await client.getPrefix());
		}
		try {
			let parseResult = await this.PARSER.command(message.content);
			if (!parseResult && !message.mentions.users.has(client.user.id)) {
				return;
			}
			const { cmd, exec } = parseResult;
			if (cmd.adminOnly && !client.utils.isAdmin(message.member, client.DB.adminRoles)) {
				await message.channel.send(`Недостаточно прав для использования этой команды!`);
				return;
			}
			if (cmd.ownerOnly && !client.utils.isOwner(message.member)) {
				await message.channel.send(`Недостаточно прав для использования этой команды!`);
				return;
			}
			if (
				cmd.moderOnly &&
				!client.utils.isMod(message.member, client.DB.modRoles, client.DB.adminRoles)
			) {
				await message.channel.send(`Недостаточно прав для использования этой команды!`);
				return;
			}
			this.log('%O', cmd);
			exec(message.member, {
				Message: message,
				Client: client,
			});
		} catch (e) {
			console.log(typeof e === 'string' && e == 'Command not found.');
			if (typeof e === 'string' && e == 'Command not found.') return;
			this.log('Error: %O', e);
		}
	}
}

let instance: Commands;
export function commands() {
	if (!instance) instance = new Commands();

	return instance;
}

export default commands;

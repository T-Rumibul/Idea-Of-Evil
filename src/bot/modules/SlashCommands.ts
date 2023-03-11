import { BaseModule } from '@bot/core/BaseModule';
import { IOEClient } from '@bot/core/IOEClient';
import Commands from '@bot/commands';
import {
	ChatInputCommandInteraction,
	Guild,
	Interaction,
	REST,
	Routes,
} from 'discord.js';

const NAME = 'SlashCommands';

/** 
    The constructor takes in an IOEClient as a 
    parameter and calls the init() 
    method to initialize the module.
    */
export class SlashCommands extends BaseModule {
	private client: IOEClient;

	constructor(client: IOEClient) {
		super(NAME);
		this.client = client;
		this.init();
	}
	/**  Registers commands for each
	 * guild in the client's guilds cache,
	 * then registers events for when an interaction
	 * is created or when a new guild is created. */

	async init() {
		this.log('Initialization');
		this.client.guilds.cache.forEach(async (value, key) => {
			await this.registerCommandsForGuild(value);
		});
		this.registerEvents();
		this.log('Initialization Completed');
	}

	private async registerCommandsForGuild(guild: Guild) {
		const rest = new REST({ version: '10' }).setToken(this.client.token || '');
		const commandsJSON = Commands.map((cmd) => cmd.command.toJSON());
		const CLIENT_ID = !process.env.dev
			? process.env.CLIENT_ID || ''
			: process.env.CLIENT_ID_DEV || '';
		await rest.put(Routes.applicationGuildCommands(CLIENT_ID, guild.id), {
			body: commandsJSON,
		});
	}

	private registerEvents() {
		this.client.on('interactionCreate', async (interaction: Interaction) => {
			if (!interaction.isChatInputCommand()) return;
			const musicChannels = await this.client.getMusicChannels();
			if (interaction.channelId === musicChannels.get(interaction.guildId || ''))
				return;
			this.executeInteraction(interaction);
		});

		this.client.on('guildCreate', async (guild) => {
			await this.registerCommandsForGuild(guild);
		});
	}

	/** Method takes in an interaction and finds
	 * the command associated with it,
	 * then executes it with the client
	 * as a parameter. */
	async executeInteraction(interaction: ChatInputCommandInteraction) {
		const command = Commands.find(
			(cmd) => cmd.command.name === interaction.commandName
		);
		if (!command) return;
		command.execute(interaction, this.client);
	}
}

let instance: SlashCommands;
/**  slashCommands() is exported as a default function which creates an instance of SlashCommands 
if one does not already exist and returns it.
*/
export function slashCommands(client: IOEClient) {
	if (!instance) instance = new SlashCommands(client);

	return instance;
}

export default slashCommands;

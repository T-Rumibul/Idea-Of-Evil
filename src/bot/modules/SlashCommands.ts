import { BaseModule } from "@bot/core/BaseModule";
import { IOEClient } from "@bot/core/IOEClient";
import Commands from "@bot/slashCommands"
import { CommandInteraction, Interaction } from "discord.js";
const { REST, Routes } = require('discord.js');
const NAME = 'SlashCommands';

export class SlashCommands extends BaseModule {
    private client: IOEClient;
    constructor(client: IOEClient) {
            super(NAME);
            this.client = client;
            this.init();
    }
    async init() {
        this.log('Initialization');
     
		
		
        const rest = new REST({ version: '10' }).setToken(this.client.token);
        const commandsJSON = Commands.map((cmd) => {
            return cmd.command.toJSON()
        })
        for (const [key, value] of this.client.guilds.cache) {
            await rest.put(
		Routes.applicationGuildCommands(process.env.CLIENT_ID, value.id),
		{ body: commandsJSON },
        );
		}
		
        

        this.registerEvents()
        this.log('Initialization Completed');
    }
    registerEvents() {
        this.client.on("interactionCreate", async (interaction: Interaction) => {
			if (!interaction.isCommand()) return;
			const musicChannels = await this.client.getMusicChannels()
			if (interaction.channelId === musicChannels.get(interaction.guildId)) return
			this.executeInteraction(interaction)

		})
    }
    async executeInteraction(interaction: CommandInteraction) {
        const cmd = Commands.find((cmd) => cmd.command.name === interaction.commandName)
        if (!cmd) return;
        cmd.execute(interaction, this.client)
    }


}
	

let instance: SlashCommands;
export function slashCommands(client: IOEClient) {
	if (!instance) instance = new SlashCommands(client);

	return instance;
}

export default slashCommands;
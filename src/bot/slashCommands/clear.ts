import { IOEClient } from "@bot/core/IOEClient"
import { ChannelType, CommandInteraction, PermissionFlagsBits, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandNumberOption } from "discord.js"
import { getLogger } from '@bot/utils/Logger';
const log = getLogger('BOT:SlashCommands');

const command = new SlashCommandBuilder()
command.setName("clear")
command.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
command.setDescription("Deletes selected amount of messages")
command.setDescriptionLocalizations({
    "ru": "Удаляет выбранное количество сообщение в текущем канале"
})
const numberOption = new SlashCommandNumberOption()
numberOption.setMinValue(1)
numberOption.setMaxValue(100)
numberOption.setAutocomplete(true)
numberOption.setDescription("Number of messages to delete")
numberOption.setDescriptionLocalizations({
    "ru": "Сколько сообщений удалить"
})
numberOption.setName("number")
.setRequired(true)
command.addNumberOption(numberOption)
        
async function execute(interaction: CommandInteraction, client: IOEClient) {
    try {
        if (interaction.channel.type !== ChannelType.GuildText) return;
        const channel = interaction.channel;
        const amount = interaction.options.get("number", true).value;
        if (typeof amount !== "number") return;

        const deleted = await channel.bulkDelete(Number(amount), true);

        const resp = await interaction.reply(`Удалено **${deleted.size}** сообщений.`);
        //client.utils.deleteMessageTimeout(resp, 5000)
    }
    catch (e) {
        log(e);
    }
}
    


export default {
    command,
    execute
};
	
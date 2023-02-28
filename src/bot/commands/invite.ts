import { IOEClient } from "@bot/core/IOEClient"
import { ChannelType, ChatInputCommandInteraction, CommandInteraction, SlashCommandBuilder } from "discord.js"
import { getLogger } from '@bot/utils/Logger';
const log = getLogger('BOT:SlashCommands');

const command = new SlashCommandBuilder()
command.setName("invite")
command.setDescription("Create an invite link to add bot to your server")
command.setDescriptionLocalizations({
    "ru": "Создает ссылку для добавления бота на свой сервер"
})    
async function execute(interaction: ChatInputCommandInteraction, client: IOEClient) {
    try {
        if (interaction.channel.type !== ChannelType.GuildText) return;
        const resp = await interaction.reply(`https://discord.com/api/oauth2/authorize?client_id=413052227750461440&permissions=8&scope=bot`);
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
	
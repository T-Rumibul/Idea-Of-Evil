import {IOEClient} from '@bot/core/IOEClient';
import {
  ChannelType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

const command = new SlashCommandBuilder();
command.setName('invite');
command.setDescription('Create an invite link to add bot to your server');
command.setDescriptionLocalizations({
  ru: 'Создает ссылку для добавления бота на свой сервер',
});
async function execute(
  interaction: ChatInputCommandInteraction,
  client: IOEClient
) {
  try {
    if (interaction.channel?.type !== ChannelType.GuildText) return;
    await interaction.reply(
      `https://discord.com/api/oauth2/authorize?client_id=${client.user?.id}&permissions=8&scope=bot`
    );
    // client.utils.deleteMessageTimeout(resp, 5000)
  } catch (e) {
    client.log('COMMAND', 'Error', e);
  }
}

export default {
  command,
  execute,
};

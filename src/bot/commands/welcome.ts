import {IOEClient} from '@bot/core/IOEClient';
import {
  ChannelType,
  ChatInputCommandInteraction,
  GuildMember,
  GuildTextBasedChannel,
  PermissionFlagsBits,
  SlashCommandBuilder,
  SlashCommandChannelOption,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} from 'discord.js';

const command = new SlashCommandBuilder();
command.setName('welcome');
command.setDescription('Commands to setup welcome module');
command.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

const channelSubcommandGroup = new SlashCommandSubcommandGroupBuilder();
channelSubcommandGroup.setName('channel');
channelSubcommandGroup
  .setDescription('Channel for sending welcome messages')
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName('set')
      .setDescription('Choose channel for welcome module')
      .addChannelOption(
        new SlashCommandChannelOption()
          .setName('channel')
          .setDescription('Choose text channel')
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true)
      )
  );
command.addSubcommandGroup(channelSubcommandGroup);

const subCommand = new SlashCommandSubcommandBuilder();
subCommand.setName('test');
subCommand.setDescription('Testing welcome module');
command.addSubcommand(subCommand);

async function execute(
  interaction: ChatInputCommandInteraction,
  client: IOEClient
) {
  try {
    if (interaction.channel?.type !== ChannelType.GuildText) return;

    if (
      interaction.options.getSubcommandGroup() === 'channel' &&
      interaction.options.getSubcommand() === 'set'
    ) {
      const channel = <GuildTextBasedChannel>(
        interaction.options.getChannel('channel', true)
      );
      if (channel.type !== ChannelType.GuildText) return;
      const {guildId} = interaction;
      if (!guildId) return;
      await client.IOE.externalDB.guild.setWelcomeChannel(guildId, channel.id);
      await interaction.reply(
        `New channel for welcome messages: <#${await client.IOE.externalDB.guild.getWelcomeChannel(
          guildId
        )}>`
      );
      return;
    }
    if (interaction.options.getSubcommand() === 'test') {
      client.modules.welcomer.sendWelcomeMesssageTrigger(
        interaction.member as GuildMember,
        client
      );
    }
  } catch (e) {
    client.log('COMMAND', 'Error:', e);
  }
}

export default {
  command,
  execute,
};

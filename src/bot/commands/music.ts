import { IOEClient } from "@bot/core/IOEClient"
import { ButtonBuilder, ChannelType, ChatInputCommandInteraction, CommandInteraction, ComponentType, GuildTextBasedChannel, Interaction, MessageComponentInteraction, PermissionFlagsBits, SlashCommandBuilder, SlashCommandChannelOption, SlashCommandIntegerOption, SlashCommandNumberOption, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from "discord.js"
import { getLogger } from '@bot/utils/Logger';
const log = getLogger('BOT:SlashCommands').log;

const command = new SlashCommandBuilder()
command.setName("music")
command.setDescription("Commands to setup music module")
command.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

const channelSubcommandGroup = new SlashCommandSubcommandGroupBuilder()
channelSubcommandGroup.setName("channel")
channelSubcommandGroup.setDescription("Channel for processing text input for music module and also for message with controll buttons")
    .setDescriptionLocalizations({
    "ru": "Канал с кнопками для управления музыкой, а также поиск и выбор треков."
    })
    .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName("set")
        .setDescription("Choose channel for music module")
        .setDescriptionLocalizations({
        "ru": "Выбрать канал для музыкального модуля"
        })
        .addChannelOption(new SlashCommandChannelOption()
            .setName("channel")
            .setDescription("Choose empty text channel")
            .setDescriptionLocalizations({
                "ru": "Выберите пустой текстовый канал"
            })
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
    )    
)
command.addSubcommandGroup(channelSubcommandGroup)

const musicSubCommand = new SlashCommandSubcommandBuilder()
musicSubCommand.setName("info")
musicSubCommand.setDescription("Info about music module")
musicSubCommand.setDescriptionLocalizations({
    "ru": "Информация о музыкальном модуле"
})
command.addSubcommand(musicSubCommand)

async function execute(interaction: ChatInputCommandInteraction, client: IOEClient) {
    try {
        if (interaction.channel.type !== ChannelType.GuildText) return;
       
        if (interaction.options.getSubcommandGroup() === "channel" && interaction.options.getSubcommand() === "set") {
             const channel = <GuildTextBasedChannel>interaction.options.getChannel("channel", true)
            if (channel.type !== ChannelType.GuildText) return;
            if ((await channel.messages.fetch({
                cache: true
            })).size > 0) {
                const reply = await interaction.reply(
                    `В канале присутствуют сообщения, создайте новый или удалите их.`
                );
                
                return;
            }
            await client.setMusicChannel(interaction.guildId, channel.id)
            const msg = await interaction.reply(
                `Новый канал для плеера: <#${(await client.getMusicChannels()).get(interaction.guildId)}>`
            );        
            await client.modules.Player.sendControllMessage(channel, interaction.guildId);
            await client.modules.Player.updateMusicChannels()
        } 
   
   
        
    }
    catch (e) {
        log(e);
    }
}
    


export default {
    command,
    execute
};
	
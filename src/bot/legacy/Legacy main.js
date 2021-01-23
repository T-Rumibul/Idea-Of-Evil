import { Collection } from 'discord.js';
import Debug from 'debug';
import config from './config.json';
import IOEClient from './modules/IOEClient';
import commmandsDescription from './commandsDesctiprion';

const debug = Debug('IOEBot:Main');
const cooldowns = new Collection();

delete config.default;
delete commmandsDescription.default;
const client = new IOEClient();
client.login(process.env.token);

// Modules
const welcomer = require('./modules/welcomer.js');
const profile = require('./modules/profile.js');
// End Modules
// let album_id = ['eCOuQ', 'PS9uP', 'Rs6Vt', 'Wr3tS', 'e0JJC', '7R5sa', 'B84oi', 'ItSDDZH'];
client.on('ready', async () => {
    debug(`${client.user.username} ready`);

    // Utility.putAllAlbumImagesIntoConfig(album_id)
});

client.on('guildMemberAdd', async (member) => {
    await welcomer.sendWelcomeMesssage(member, config.welcome_channel);
});

client.on('message', async (message) => {
    if (message.author.bot) return;
    // Modules
    await profile.levelSys(message.member, message);
    await profile.emoji_use(message.member, message);
    await profile.statistics(message.guild);
    // End of Modules
    if (!message.guild) {
        await message.reply('Вы не можете использовать комманды в ЛС.');
        return;
    }

    if (message.content.indexOf(config.prefix) !== 0) return;
    const args = message.content.toLowerCase().trim().slice(config.prefix.length).split(/ +/g);
    if (args !== undefined) {
        const cmd = args.shift();
    }

    const command =
        client.commands.get(cmd) ||
        client.commands.find((command) => command.aliases && command.aliases.includes(cmd));
    // If command don't exists
    if (!command) {
        await message.reply('Нет такой команды');
        return;
    }
    // Aruments
    if (command.args && !args.length) {
        let reply = `Неправильная команда, ${message.author}!`;

        if (command.usage) {
            reply += `\nПравильное использование: \`${config.prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
    }
    // For idiots that are trying to write in DM
    if (command.guildOnly && message.channel.type !== 'text') {
        return message.reply('Вы не можете использовать команды в ЛС.');
    }
    // Admin commands
    if (command.adminonly && !client.isAdmin(message.member))
        return message.reply('Для использования этой команды нужно иметь права администратора.');
    // Cooldown for commands
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 0) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            const reply = await message.reply(
                `Осталось ${timeLeft.toFixed(1)} секунд до повтороного использования \`${
                    command.name
                }\`.`
            );
            await message.delete();
            await reply.delete(timeLeft * 1000);
            return;
        }
    }
    try {
        command.execute(message, args);
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    } catch (error) {
        console.error(error);
        message.reply('ERROR! <@231449604711907328>');
    }
    function isAdmin(member) {
        if (member.hasPermission('ADMINISTRATOR')) {
            return true;
        }
        return false;
    }
});
client.on('guildMemberRemove', async (member) => {
    profile.statistics(member.guild);
});
client.on('guildMemberAdd', async (member) => {
    profile.statistics(member.guild);
});
client.on('error', console.error);

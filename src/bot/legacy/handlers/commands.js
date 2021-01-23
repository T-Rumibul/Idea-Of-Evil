import fs from 'fs';

export default async (IOEBot) => {
    const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));
    commandFiles.forEach((file) => {
        // eslint-disable-next-line import/no-dynamic-require,global-require
        const command = require(`./commands/${file}`);

        // set a new item in the Collection
        // with the key as the command name and the value as the exported module
        IOEBot.commands.set(command.name, command);
    });
};

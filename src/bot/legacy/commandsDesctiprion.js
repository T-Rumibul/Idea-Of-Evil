const config = require('./config.json')
delete config.default;
let defaultEmbed = {
    "embed": {
     "title": "Такой комманды не существует или вы ввели её непрвильно",
     "color": 0x26c702,
      "author": {
        "name": "Help"
      },
      "fields": [
        {
          "name": "**Использование:**",
          "value": " default"
        }
      ]
    }
  }
module.exports = {
    stats: async (message) =>{
      defaultEmbed.embed.color = 0x26c702;
    defaultEmbed.embed.title = "Показывает вашу или статистику другого пользователя";
    defaultEmbed.embed.fields[0].value = `${config.prefix}stats [user]`;
   
    await message.channel.send( 
      defaultEmbed
    )
},
changecolor: async (message) =>{
  defaultEmbed.embed.color = 0x26c702;
    defaultEmbed.embed.title = "Изменяет цвет личной роли || для использованию нужно иметь личную роль";
    defaultEmbed.embed.fields[0].value = `${config.prefix}changecolor [color in hex format]\n${config.prefix}cc [color in hex format]`;
   
    await message.channel.send( 
      defaultEmbed
    )

},
errorResponse: async (message)=> {
  defaultEmbed.embed.color = 0xd90218;
  defaultEmbed.embed.title = `Такой комманды не существует или вы ввели её непрвильно`;
  defaultEmbed.embed.fields[0].value = `${config.prefix}help [command]\n${config.prefix}h [command]`;
   await message.channel.send( 
    defaultEmbed
    )
}
}
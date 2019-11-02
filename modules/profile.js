const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const Discord = require('discord.js')
const adapter = new FileSync('db.json')
const db = low(adapter)
const usersDB = db.get('users')
const guildDB = db.get('guild')
const Utility = require('./Utility.js')
function updateDB(id, value) {
    usersDB.find({
        userID: id
    }).assign(value).write()
}
let wait_list = [];
let emoji_wait_list = []

async function addexp (member, message) {
    //Check if user in db
            let lvl =  usersDB.find({userID: member.id}).value().lvl
            let prestige = usersDB.find({userID: member.id}).value().prestige
            let exp = (50+(lvl*1))+(prestige*(lvl/10)) //Начисление опыта
            if (!exp) return false
            console.log(`Added ${exp} exp to ` + member.user.username)
            updateDB(member.id, { exp: Math.round(usersDB.find({userID: member.id}).value().exp + exp)
            })
                   
}
module.exports.addmoderator = async(message) => {
    if(Utility.isAdmin(message.member)) {
       let member = message.mentions.members.first()
       guildDB.push({ id: guildDB.size().value() + 1, userID: member.id, exp: 25, lvl:1, prestige:0, emoji:[{}] }).write()
    } else {
        message.reply(`У вас нет прав для использования этой комманды!`)
    }
}
module.exports.emoji_use = async(member, message) => {
    if (emoji_wait_list.indexOf(member.id) === -1) {
        if (message.content.search(/<:\w+:\d+>/g) != -1) {
            let emoji_list = message.content.match(/<:\w+:\d+>/g);
            emoji_list = emoji_list.filter((item) => {
                return member.guild.emojis.get(item.match(/\w:\d+/g)[0].match(/\d+/g)[0]) //Если какой-то пидор юзает нитро и глобал эмоджи
            })

        
            emoji_list = emoji_list.filter((item, i, arr) => { //Отсеивание одинаковых эмоджи
                for (i + 1; i < arr.length; i++) {
                    if ((i + 1) == arr.length) return true;
                    if (item === arr[i + 1]) return false
                }
            })
            console.log(emoji_list)
            for (let i = 0; i < emoji_list.length; i++) {
                if (!usersDB.find({ userID: member.id }).get('emoji').value()) { //Если в бд нет пользователя

                    usersDB.find({ userID: member.id }).set('emoji', [{}]).write() //создает массив эмоджи

                    let emoji_obj = usersDB.find({ userID: member.id }).get('emoji').value()[0] //получает массив и записывает в него новое значение
                    emoji_obj[emoji_list[i]] = 1

                    usersDB.find({ userID: member.id }).get('emoji').assign(emoji_obj).write()
                    if(guildDB.value()) {//Для статистики
                    guildDB.assign({emoji_uses: guildDB.value().emoji_uses+1}).write()
                }

                } else {
                    if (usersDB.find({ userID: member.id }).get('emoji').value()[0][emoji_list[i]] == undefined) {//Если такое эмоджи не использовалось, то добавляем его
                       
                        let emoji_obj = usersDB.find({ userID: member.id }).get('emoji').value()[0]

                        emoji_obj[emoji_list[i]] = 1

                        usersDB.find({ userID: member.id }).get('emoji').assign(emoji_obj).write()
                        if(guildDB.value()) {//Для статистики
                            guildDB.assign({emoji_uses: guildDB.value().emoji_uses+1}).write()
                        }
                    } else {

                        let emoji_obj = usersDB.find({ userID: member.id }).get('emoji').value()[0]

                        emoji_obj[emoji_list[i]] = usersDB.find({ userID: member.id }).get('emoji').value()[0][emoji_list[i]] + 1

                        usersDB.find({ userID: member.id }).get('emoji').assign(emoji_obj).write() 
                        
                        if(guildDB.value()) {//Для статистики
                            guildDB.assign({emoji_uses: guildDB.value().emoji_uses+1}).write()
                        }
                    }
                }
            }
            console.log('Added emoji use')
            emoji_wait_list.push(member.id)
            let deley = Math.floor(Math.random() * (3000 - 1000)) + 1000
            console.log(deley)
            await setTimeout(() => {
                emoji_wait_list.splice(emoji_wait_list.indexOf(member.id), 1)
                console.log("Member deleted from emoji wait list " + member.user.username)
            }, deley )
        }
  }
}
let lvl_list = [25]

for(let i = 1, level = 2, progression = 50; i<1000; i++, level++, progression = progression+6) {
  lvl_list.push(Math.round(lvl_list[i-1]+progression))   
}
let levelSys = async (member, message)  => {
    //Проверяем есть ли в бд пользователь, а так же, есть ли у него поле с опытом
 if (usersDB.find({userID: member.id }).value()) {
 
 
 
 if (usersDB.find({ userID: member.id }).value().exp != undefined) {
     let exp = usersDB.find({ userID: member.id }).value().exp
   if (usersDB.find({ userID: member.id }).value().lvl != undefined && usersDB.find({ userID: member.id }).value().prestige != undefined) {
     if (wait_list.indexOf(member.id) != -1) return
     await addexp(member, message)
     for(let i = 0; true; i++) {
           
         if(exp>=lvl_list[i] && exp<lvl_list[i+1]) {
             usersDB.find({ userID: member.id }).assign({lvl: i+1, prestige: ( (i+1)-((i+1)%100))/100 }).write()
             break
         }
             
     } 
 
   } else {
     usersDB.find({ userID: member.id }).set('lvl', 1).write()
     usersDB.find({ userID: member.id }).set('prestige', 0).write()
     await addexp(member, message)
     for(let i = 0; true; i++) {
           
         if(exp>=lvl_list[i] && exp<lvl_list[i+1]) {
             usersDB.find({ userID: member.id }).assign({lvl: i+1%100, prestige: ( (i+1)-((i+1)%100))/100 }).write()
             break
         }
             
     }
   }
   
      
 }
 if (wait_list.indexOf(member.id) != -1) return
 wait_list.push(member.id)
 let deley = Math.floor(Math.random() * (120000 - 60000)) + 60000
     console.log(deley)
 await setTimeout(() => {
     wait_list.splice(wait_list.indexOf(member.id), 1)
     console.log("Member deleted from wait list " + member.user.username)
 }, deley)
 
 
 } else {
     usersDB.push({ id: usersDB.size().value() + 1, userID: member.id, exp: 25, lvl:1, prestige:0, emoji:[{}] }).write()
     console.log('New user added ' + member.user.username)
 }
 
 }
 module.exports.levelSys = levelSys;

module.exports.statistics = async (guild) => {
    let memers_channel = guild.channels.get('559571103786336267')
    let messages_channel = guild.channels.get('559571016490418206')
    let emoji_channel = guild.channels.get('559571185202102282')
    if(!guildDB.value()) {
    db.set('guild', {emoji_uses: 0, members: guild.memberCount, messages: 1}).write()
    
        // let messages = usersDB.get('guild').assign({usersDB.get('guild').messages+1}).write()
        
      
    } else {
       
        guildDB.assign({members:guild.memberCount, messages: guildDB.value().messages+1}).write()
        messages_channel.edit({name: `Сообщений: ${guildDB.value().messages}`}) 
        memers_channel.edit({name: `Пользователей: ${guild.memberCount}`})
        emoji_channel.edit({name: `Эмоджи: ${guildDB.value().emoji_uses}`})
    }
}



module.exports.addcolor = async (message, color) => {
    let role = message.member.highestRole
    role.edit({
        color: color,
      })
        .then(role => {
            console.log(`Edit role with name ${role.name} and color ${role.color} by ${message.member.nickname}`);
            message.member.roles
            message.member.addRole(role, "Color Change");
            message.react('✅')
  .catch(console.error);
    })
        .catch(console.error)

}


module.exports.clearOldEmoji = async (message) => {
      let members = message.guild.members
        members.forEach(member => {
        if(usersDB.find({ userID: member.id }).get('emoji').value() != undefined) {
        let emoji_keys = Object.keys(usersDB.find({ userID: member.id }).get('emoji').value()[0]) 
        emoji_keys.forEach(item => {
            if (message.guild.emojis.get(item.match(/\w:\d+/g)[0].match(/\d+/g)[0]) == undefined) {
               delete usersDB.find({ userID: member.id }).get('emoji').value()[0][item]
               usersDB.write()
            }
        })
    }
    })
}



module.exports.stats = async (member, message) => {
    if(usersDB.find({userID: member.id }).value()) {
       await levelSys(member, message)} else message.channel.send('Такого пользователя нет на сервере')
    let embed = new Discord.RichEmbed()
    let avatar;
    if (member.user.avatarURL) {
        avatar = member.user.avatarURL
    } else { // Если дауничь без авы
        avatar = member.user.defaultAvatarURL

    }
    embed.setAuthor(member.user.username, avatar)
    embed.addField('Уровень:', " " + usersDB.find({
        userID: member.id
    }).value().lvl, true)
    embed.addField('Престиж:', " " + usersDB.find({
        userID: member.id
    }).value().prestige, true)
    embed.addField('Опыт:', "<:exp:637228997134123021> " + usersDB.find({
        userID: member.id
    }).value().exp, true)

    if (usersDB.find({ userID: member.id }).get('emoji').value()) {
        let sortable = [];
        let emoji_obj = usersDB.find({ userID: member.id }).get('emoji').value()[0]
        for (let emoji in emoji_obj) {
            sortable.push([emoji, emoji_obj[emoji]]);
        }
        sortable.sort(function (a, b) {
            return b[1] - a[1];
        });
        if (sortable.length > 0) {

           sortable = sortable.filter(item => { //Проверка на то, есть ли эмоджи на сервере(в целом не нужна)
                if (member.guild.emojis.get(item[0].match(/\w:\d+/g)[0].match(/\d+/g)[0])) return true
                else return false
            })

           
            if (sortable.length > 0) {
                let emoji_list = '';
                for (let i = 0; i < sortable.length; i++) {
                    emoji_list += ' ' + sortable[i][0]
                    if (i == 5) {
                        break
                    }
                }
                embed.addField('Любимые эмоджи', emoji_list, true)

            } else {
                embed.addField('Любимые эмоджи', 'None', true)
            }

        } else {
            embed.addField('Любимые эмоджи', 'None', true)
        }
    }
    embed.setColor(11277888)
    await message.channel.send(embed)
}

module.exports.serverinfo = async (member, message) => {
    let embed = new Discord.RichEmbed();
    let online_members = 0;
    let dnd_members = 0
    let afk_members = 0
    usersDB.forEach(user => {
        console.log(user)
    })
    member.guild.members.forEach(user => { //Подсчет пользователей онлайн и тд
        if (user.presence.status == 'online') {
            online_members += 1
        } else if (user.presence.status == 'dnd') {
            dnd_members += 1
        } else if (user.presence.status == 'idle') {
            afk_members += 1
        }

    });

    let o1 = {}
    let emoji_arr = []
    let sortable = []
    let top_emoji = ''
  
    usersDB.value().forEach( item => { //Парсинг списка юзеров и включение использованых ими эмоджи в массив объектов
        if (item.emoji != undefined && item.emoji.length > 0) {
            emoji_arr.push(item.emoji[0])
        }

    })
    emoji_arr.reduce((a, o) => { //превращение массива в один объект без дублирующихся значений
        Object.keys(o).map(k => a[k] = (a[k] || 0) + o[k])
        return a;
    }, o1)

    for (let emoji in o1) { //создание массива массивов с двумя значениями, 1-е название эмоджи 2-е количество использований
        sortable.push([emoji, o1[emoji]]);
    }
    sortable.sort(function (a, b) { //сортировка
        return b[1] - a[1];
    });

    for (let i = 0; i < sortable.length; i++) {
        top_emoji += ' ' + sortable[i][0]
        if (i == 6) {
            break
        }
    }
    embed.setColor(11277888)
        .setAuthor(member.guild.name)
        .setThumbnail(member.guild.iconURL)
        .addField('Владелец:', "<:crown:637229983445680128>" + member.guild.owner, true)
        .addField('Участники:', "<:discord:637229965149995028>" + member.guild.memberCount, true)
        .addField('В сети', "<:online:637229904110551040>" + online_members, true)
        .addField('Не беспокоить', "<:dnd:637229916173369344> " + dnd_members, true)
        .addField('АФК', "<:idle:637229939904741394>" + afk_members, true)
        .addField('Популярные эмодзи:', top_emoji)
    await message.channel.send(embed);
}

module.exports.topEmoji = async (member, message) => {
    let o1 = {}
    let emoji_arr = []
    let sortable = []
    for (let i = 0; i < usersDB.value().length; i++) {
        if (usersDB.value()[i].emoji != undefined && usersDB.value()[i].emoji.length > 0) {
            emoji_arr.push(usersDB.value()[i].emoji[0])
        }
    }

    emoji_arr.reduce((a, o) => {
        Object.keys(o).map(k => a[k] = (a[k] || 0) + o[k])
        return a;
    }, o1)

    for (let emoji in o1) {
        sortable.push([emoji, o1[emoji]]);
    }
    sortable.sort(function (a, b) {
        return b[1] - a[1];
    });
    // for (let i = 0; i < sortable.length; i++) {
    //     top_emoji += '\n ' + (i + 1) + '.  ' + sortable[i][0] + '  Использований: ' + sortable[i][1]
    //     if (i == 9) {
    //         break
    //     }
    // }
    let array = sortable.map(item => {
        return [item[0], item[1]]
    })
    console.log(array)
    await create_top_list(array, message, member, 'эмоджи', 'Использований')
}
module.exports.topExp = async (member, message) => {
    let exp_arr = []
    let sortable = []
    for (let i = 0; i < usersDB.value().length; i++) {
        let user_obj = {}
        if (usersDB.value()[i].exp != undefined) {
            
            let guild_member = member.guild.members.get(usersDB.value()[i].userID)
            if (guild_member) {
                
            user_obj[guild_member.user.username] = usersDB.value()[i].exp
            exp_arr.push(user_obj)
            
        } 
        }
    }
  
  exp_arr.forEach((item) => {
    for (let user in item) {
        sortable.push([user, item[user]]);
    }
  })  
    console.log(sortable)
    sortable.sort(function (a, b) {
        return b[1] - a[1];
    });
    
    let array = sortable.map(item => {
        return [item[0], item[1]]
    })
    
    await create_top_list(array, message, member, 'опыта', '<:exp2:556641159384924205> ')
}



async function create_top_list(array, message, member, name, namefield) {
   function create_default_embed() {
        let default_embed = new Discord.RichEmbed(); //Дефолтное заполнение эмбеда
        default_embed.setAuthor(member.guild.name, member.guild.iconURL)
        .setColor(11277888)
        .addField('Топ '+name+ ':','\u200B', true)
        .addField('Всего: '+ array.reduce( (sum, arr)=> {
            return sum + arr[1]
        }, 0), '\u200B', true)
        return default_embed
    }
    let embed = create_default_embed()
    let embed_array = []

    array.forEach(async (item, i) => {  //Перебираем массив и выводим топ
        if (embed.fields.length === 12) {
            embed_array.push(embed)
            embed = create_default_embed()  
        } else if (i == (array.length -1)) {
            embed_array.push(embed)
        } 
        embed.addField((i+1)+'. '+item[0]+' '+namefield+': '+item[1], '\u200B') 
    })
    await message.channel.send(embed_array[0]).then(async (message)=> {
       await message.react('◀').then(async ()=> {//добавляем стрелки управления
           await message.react('▶')
       }).then(async () => {
            let i = 0;
           message.awaitReactions((reaction, user)=> {//проверяем на нажатие
            if (!user.bot && (reaction.emoji.name === '◀' || reaction.emoji.name === '▶')){
                reaction.remove(user);
                
                if(reaction.emoji.name === '▶') {
                    i = i+1
                    i<embed_array.length ? message.edit(embed_array[i]): i=i-1 //Если в массиве есть еще эмоджи - выводим
                } else if (reaction.emoji.name === '◀') {
                    i = i -1
                    i==-1 ? i= i+1: message.edit(embed_array[i]) // Проверка, чтобы не получить undefined
                    
                }
            } 
           }, { time: 40000 })
           await setTimeout(async () => {
              await message.edit(embed_array[0])
              await message.clearReactions();
           }, 40000)
       })
    })





}
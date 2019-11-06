const rp = require('request-promise')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('config.json')
const db = low(adapter)
const imagesDB = db.get('images')
module.exports = {
     isAdmin: (member) => {
    if(member.hasPermission("ADMINISTRATOR")) {
        return true;
    } else return false;
    
},
isModerator: (member) => {
        
},
getAlbumImages: (album_id) => {
    var options = {
        uri: `https://api.imgur.com/3/album/${album_id}/images`,
        headers: {
            'Authorization': 'Client-ID 552f3a1b35f2d87'
        },
        json: true // Automatically parses the JSON string in the response
    };
    // ID : 552f3a1b35f2d87
    // Sercet : f254afd85face9c3be5504d2581a57c3b1908252
    // Hug album
    return rp(options)
     
},
putAllAlbumImagesIntoConfig: async (album_id) => {
    let options = {
        headers: {
            'Authorization': 'Client-ID 552f3a1b35f2d87'
        },
        json: true // Automatically parses the JSON string in the response
    };
    // ID : 552f3a1b35f2d87
    // Sercet : f254afd85face9c3be5504d2581a57c3b1908252
    album_id.forEach(id => {
        options.uri = `https://api.imgur.com/3/album/${id}`;
        rp(options).then((response) => {
            if(response.status == 200) { 
                let links = [];
                for(i=0; i<response.data.images.length; i++) {
                    links.push(response.data.images[i].link)
                }
                imagesDB.push({type : response.data.title, images_links: links}).write()
        }}).catch((err)=> {
            console.log(err)
        })

    });
    
},
reactConfirm: async (message, member)=> {
    await message.react('✅')
    await message.react('❌')
    let confirm;
    const filter = (reaction, user) => {
        return ['✅', '❌'].includes(reaction.emoji.name) && member.id === user.id;
    };
    await message.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
        .then(collected => {
            const reaction = collected.first();
            if(reaction.emoji.name == '✅') return confirm = true
            else if(reaction.emoji.name == '❌') return confirm = false
        })
        .catch(collected => {
        });
    return confirm;
    
}
}
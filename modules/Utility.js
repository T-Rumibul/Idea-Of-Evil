module.exports = {
     isAdmin: (member) => {
    if(member.hasPermission("ADMINISTRATOR")) {
        return true;
    } else return false;
   
},
isModerator: (member) => {
        
}

}
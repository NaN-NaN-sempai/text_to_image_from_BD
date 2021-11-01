var fs = require("fs");
var itemDir = "./images/";

module.exports = (dir) => {
    var list = [];
    
    fs.readdirSync(itemDir + dir + "/").forEach(file => {
        list.push(file.split(".")[0]);
    });
    
    return list;
};
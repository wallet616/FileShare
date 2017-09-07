"use strict";

const fs = require("fs");


module.exports.get = function(req, res) {
    var source = fs.readFileSync(__dirname + "/" + "footer.html", "utf8");

    return source;
}
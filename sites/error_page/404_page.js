"use strict";

const fs = require("fs");

module.exports.handle = function(req, res) {
    var source = fs.readFileSync(__dirname + "/" + "404_page.html", "utf8");

    if (req.cookies.cookies_accepted) {
        source = source.replace("{cookies_alert}", "");
    } else {
        var cookies_message = fs.readFileSync(__dirname + "/../cookies_alert/cookies_message.html", "utf8");
        source = source.replace("{cookies_alert}", cookies_message);
    }

    res.status(404);
    res.send(source);
}
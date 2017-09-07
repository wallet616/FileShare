"use strict";

const fs = require("fs");
const cookies_alert = require("../../modules/cookies_alert/cookies_alert");
const footer = require("../../modules/footer/footer");

module.exports.handle = function(req, res) {
    var source = fs.readFileSync(__dirname + "/" + "404_page.html", "utf8");

    var new_cookies_alert = cookies_alert.get(req, res);
    source = source.replace("{cookies_alert}", new_cookies_alert);

    var new_footer = footer.get(req, res);
    source = source.replace("{footer}", new_footer);

    res.status(404);
    res.send(source);
}
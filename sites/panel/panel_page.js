"use strict";

const fs = require("fs");
const cookie = require("cookie");
const cookies_alert = require("../../modules/cookies_alert/cookies_alert");
const footer = require("../../modules/footer/footer");

module.exports.handle = function(req, res) {

    // Check if user is logged.
    if (req.session.logged !== true) {
        res.send("<script> window.location.href = '/login'; </script>");
        return;
    }

    req.session.logged = true;


    // Send the site.
    var source = fs.readFileSync(__dirname + "/" + "panel_page.html", "utf8");

    var new_cookies_alert = cookies_alert.get(req, res);
    source = source.replace("{cookies_alert}", new_cookies_alert);

    var new_footer = footer.get(req, res);
    source = source.replace("{footer}", new_footer);

    res.send(source);
}


module.exports.ajax = function(req, res) {
    var response = {};
    response.status = "NO_OK";

    if (req.session.logged !== true) {
        res.send(response);
        return;
    }





    response.status = "OK";
    res.send(response);
}
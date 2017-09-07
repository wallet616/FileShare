"use strict";

const fs = require("fs");
const cookie = require("cookie");
const cookies_alert = require("../../modules/cookies_alert/cookies_alert");
const footer = require("../../modules/footer/footer");

var pins = [
    77295,
    1359
];
for (var i in pins) {
    pins[i] = String(pins[i]);
}


module.exports.handle = function(req, res) {

    // Check if user is already logged.
    if (req.session.logged === true) {
        res.send("<script> window.location.href = '/panel'; </script>");
        return;
    }


    // Send the site.
    var source = fs.readFileSync(__dirname + "/" + "login_page.html", "utf8");

    var new_cookies_alert = cookies_alert.get(req, res);
    source = source.replace("{cookies_alert}", new_cookies_alert);

    var new_footer = footer.get(req, res);
    source = source.replace("{footer}", new_footer);

    res.send(source);
}


module.exports.ajax = function(req, res) {
    var response = {};

    if (req.body.request === "login" && req.body.key) {
        var key = req.body.key.split(",");
        var found = false;

        for (var i in pins) {
            found = false;

            if (pins[i].length > key.length) {
                continue;
            }

            var delta = key.length - pins[i].length;

            found = true;
            for (var j = pins[i].length - 1; j >= 0; j--) {
                if (key[j + delta] !== pins[i][j]) {
                    found = false;
                    break;
                }
            }

            if (found) break;
        }



        if (found) {
            req.session.logged = true;
            response.status = "OK";
        } else {
            response.status = "NO_OK";
        }
    }




    res.send(response);
}
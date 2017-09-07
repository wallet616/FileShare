"use strict";

const fs = require("fs");
const cookie = require("cookie");


module.exports.ajax = function(req, res) {
    var response = {};
    response.status = "OK";

    res.setHeader("Set-Cookie", cookie.serialize("cookies_accepted", true, {
        path: "/",
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 365 // 1 year 
    }));

    res.send(response);
}


module.exports.get = function(req, res) {
    var source;

    if (req.cookies.cookies_accepted) {
        source = "";
    } else {
        source = fs.readFileSync(__dirname + "/" + "cookies_alert.html", "utf8");
    }

    return source;
}
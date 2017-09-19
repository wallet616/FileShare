"use strict";

const fs = require("fs");
const cookie = require("cookie");
const cookies_alert = require("../../modules/cookies_alert/cookies_alert");
const footer = require("../../modules/footer/footer");

const error_page = require("../error_page/404_page");
const panel = require("../panel/panel_page");

module.exports.handle = function(req, res) {

    var id = req.query.id;
    var resource = panel.files_list[id];

    if (resource) {
        // Send the site.
        var source = fs.readFileSync(__dirname + "/" + "download_page.html", "utf8");
        var preview = fs.readFileSync(__dirname + "/" + "view_archive.html", "utf8");
        var new_cookies_alert = cookies_alert.get(req, res);
        source = source.replace("{cookies_alert}", new_cookies_alert);

        var new_footer = footer.get(req, res);
        var expires_text = (resource.never_exipres) ? "nigdy" : resource.expires;
        source = source
            .replace("{footer}", new_footer)
            .replace("{preview}", preview)
            .replace("{file_name}", resource.name)
            .replace("{file_id}", resource.id)
            .replace("{expires_date}", expires_text);

        res.send(source);

    } else {
        error_page.handle(req, res);
    }


}


module.exports.ajax = function(req, res) {
    var response = {};
    response.status = "NO_OK";

    var id = req.query.id;
    var resource = panel.files_list[id];

    if (resource) {
        var f = fs.readFileSync(resource.path, "utf8");
        f = JSON.parse(f);

        response.status = "OK";
        response.data = f.data;
        response.name = resource.name;
    }

    res.send(response);
}
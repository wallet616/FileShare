"use strict";

const fs = require("fs");
const cookie = require("cookie");
const cookies_alert = require("../../modules/cookies_alert/cookies_alert");
const footer = require("../../modules/footer/footer");

module.exports.files_list = {};
load_files_to_cache();

function File_element(id, name, expires, never_exipres, path) {
    return {
        id: id,
        name: name,
        expires: expires,
        never_exipres: never_exipres,
        path: path
    }
}

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

    if (req.body.command == "upload") {
        var new_file_id = "file_" + new Date().getTime();
        req.body.id = new_file_id;
        var new_path = __dirname + "/../../files/" + req.body.id + ".json";

        fs.writeFileSync(new_path, JSON.stringify(req.body), "utf8");

        var new_element = File_element(req.body.id, req.body.name, req.body.expire_date, req.body.expire_never, new_path);

        module.exports.files_list[req.body.id] = new_element;
    } else if (req.body.command == "get_list") {

        response.data = module.exports.files_list;

    } else {
        response.status = "NO_OK";
    }



    res.send(response);
}

function register_files(list_of_paths) {
    for (var i in list_of_paths) {
        var new_path = __dirname + "/../../" + list_of_paths[i];

        var f = fs.readFileSync(new_path, "utf8");
        f = JSON.parse(f);

        var new_element = File_element(f.id, f.name, f.expire_date, f.expire_never, new_path);
        module.exports.files_list[f.id] = new_element;
    }
}

function load_files_to_cache() {
    var results = [];
    var dir = "files";

    function search(dir) {
        var list = fs.readdirSync(dir);

        for (var i in list) {
            var file = dir + "/" + list[i];
            var stat = fs.statSync(file);

            if (stat && stat.isDirectory()) {
                search(file);
            } else {
                results.push(file);
            }
        }
    };
    search(dir);

    register_files(results);
}
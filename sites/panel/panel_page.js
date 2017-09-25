"use strict";

const fs = require("fs");
const cookie = require("cookie");
const cookies_alert = require("../../modules/cookies_alert/cookies_alert");
const footer = require("../../modules/footer/footer");

module.exports.files_list = {};
load_files_to_cache();

function File_element(id, name, expires, never_exipres, path, size) {
    return {
        id: id,
        name: name,
        expires: expires,
        never_exipres: never_exipres,
        path: path,
        size: size
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

module.exports.delete_file = function(id) {
    if (module.exports.files_list[id]) {
        fs.unlinkSync(module.exports.files_list[id].path);
        delete module.exports.files_list[id];

        return true;
    } else {
        return false;
    }
}

function create_scheduled_delete(id) {
    var el = module.exports.files_list[id];

    if (el) {
        var date_current = new Date();

        var date_1 = new Date(el.expires);
        date_1.setHours(23);
        date_1.setMinutes(59);
        date_1.setSeconds(59);

        var delta = date_1.getTime() - date_current.getTime() + 60000;
        if (delta < 0) delta = 0;

        console.log(delta);

        setTimeout(function() {
            module.exports.scheduled_delete_file(id);
        }, delta);
    }


}

module.exports.scheduled_delete_file = function(id) {
    var el = module.exports.files_list[id];

    if (el && el.never_exipres != "true") {
        var date_current = new Date();

        var date_1 = new Date(el.expires);
        date_1.setHours(23);
        date_1.setMinutes(59);
        date_1.setSeconds(59);

        if (date_current >= date_1) {
            module.exports.delete_file(id);
        }
    }

}

module.exports.change_file = function(req_body) {
    var el = module.exports.files_list[req_body.id];

    if (el) {
        var f = fs.readFileSync(el.path, "utf8");
        f = JSON.parse(f);

        f.expire_date = req_body.expires;
        el.expires = req_body.expires;
        f.expire_never = req_body.expires_never;
        el.never_exipres = req_body.expires_never;
        f.name = req_body.name;
        el.name = req_body.name;

        fs.writeFileSync(el.path, JSON.stringify(f), "utf8");

        create_scheduled_delete(el.id);

        return true;
    } else {
        return false;
    }
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

        var new_size = Buffer.byteLength(req.body.data, "base64");
        req.body.size = new_size;
        fs.writeFileSync(new_path, JSON.stringify(req.body), "utf8");

        var new_element = File_element(req.body.id, req.body.name, req.body.expire_date, req.body.expire_never, new_path, new_size);

        module.exports.files_list[req.body.id] = new_element;
    } else if (req.body.command == "get_list") {

        response.data = module.exports.files_list;

    } else if (req.body.command == "delete") {
        if (module.exports.delete_file(req.body.id)) {
            response.status = "OK";
        } else {
            response.status = "NO_OK";
        }

    } else if (req.body.command == "change") {
        if (module.exports.change_file(req.body)) {
            response.status = "OK";
        } else {
            response.status = "NO_OK";
        }

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

        var new_element = File_element(f.id, f.name, f.expire_date, f.expire_never, new_path, f.size);
        module.exports.files_list[f.id] = new_element;

        create_scheduled_delete(f.id);
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
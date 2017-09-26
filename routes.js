"use strict";

const error_page = require("./sites/error_page/404_page");
const login_page = require("./sites/login/login_page");
const panel_page = require("./sites/panel/panel_page");
const download_page = require("./sites/download/download");
const cookies_alert = require("./modules/cookies_alert/cookies_alert");

module.exports = function(app) {

    ///////////////////////////////////////////////////
    // Home page:
    app.get("/", function(req, res) {
        login_page.handle(req, res);
    });


    ///////////////////////////////////////////////////
    // Login page & ajax:
    app.get("/login", login_page.handle);
    app.post("/ajax/login", login_page.ajax);


    ///////////////////////////////////////////////////
    // Panel page & ajax:
    app.get("/panel", panel_page.handle);
    app.post("/ajax/panel", panel_page.ajax);


    ///////////////////////////////////////////////////
    // Download page & ajax:
    app.get("/download", download_page.handle);
    app.get("/ajax/download", download_page.ajax);




    ///////////////////////////////////////////////////
    // Cookies alert:
    app.post("/ajax/cookies_alert", cookies_alert.ajax);





    ///////////////////////////////////////////////////
    // Everything else - not found:
    app.get("*", function(req, res) {
        error_page.handle(req, res);
    });
}
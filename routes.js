const error_page = require("./sites/error_page/404_page");
const cookies_alert = require("./sites/cookies_alert/cookies_alert");

module.exports = function(app) {

    ///////////////////////////////////////////////////
    // Home page:
    app.get("/", function(req, res) {
        req.session.s = "tak";
        res.send("home page");

        console.log(req.session.s);
    });




    ///////////////////////////////////////////////////
    // Ajax:
    app.post("/ajax/cookies_alert", function(req, res) {
        cookies_alert.handle(req, res);
    });





    ///////////////////////////////////////////////////
    // Everything else - not found:
    app.get("*", function(req, res) {
        error_page.handle(req, res);
    });
}
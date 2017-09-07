const error_page = require("./sites/error_page/404_page");
const cookies_alert = require("./modules/cookies_alert/cookies_alert");

module.exports = function(app) {

    ///////////////////////////////////////////////////
    // Home page:
    app.get("/", function(req, res) {
        // Tak się ustawia sesje:
        req.session.s = "tak";

        // Tak się nadaje odpowiedź do użytkownika:
        res.send("home page");

        // A to zwykły debug.
        console.log(req.session.s);
    });




    ///////////////////////////////////////////////////
    // Ajax:
    app.post("/ajax/cookies_alert", cookies_alert.ajax);





    ///////////////////////////////////////////////////
    // Everything else - not found:
    app.get("*", function(req, res) {
        error_page.handle(req, res);
    });
}
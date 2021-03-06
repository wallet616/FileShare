"use strict";

var express = require("express");
var session = require("express-session");
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var terminal = require("./terminal");


///////////////////////////////////////////////////
// Local data:
var address = "localhost";
var port = 61611;


///////////////////////////////////////////////////
// Assign sessions for express:
app.use(session({
    secret: "session",
    cookie: {
        maxAge: 86400000
    },
    saveUninitialized: false,
    resave: true,
    rolling: true,
}));

///////////////////////////////////////////////////
// Assign cookies parser for express:
app.use(cookieParser());

///////////////////////////////////////////////////
// Parse body application/x-www-form-urlencoded:
app.use(bodyParser.urlencoded({ reviver: true, extended: false, limit: "1gb" }));

///////////////////////////////////////////////////
// Parse body application/json:
app.use(bodyParser.json({ reviver: true, extended: false, limit: "1gb" }))


///////////////////////////////////////////////////
// Assign assets directory for express:
app.use(express.static("assets"));



///////////////////////////////////////////////////
// Handle the route:
var routes = require("./routes")(app);






///////////////////////////////////////////////////
// Define the server:
var server = app.listen(port, function() {
    // Done.
    console.log("Listening at http://" + address + ":" + port);
    terminal();
});
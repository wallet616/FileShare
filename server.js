"use strict";

var express = require("express");
var session = require("express-session");
var cookieParser = require('cookie-parser');
var app = express();
var terminal = require("./terminal");


///////////////////////////////////////////////////
// Local data:
var address = "localhost";
var port = "61611";


///////////////////////////////////////////////////
// Assign sessions for express:
app.use(session({
    secret: "session",
    cookie: {
        maxAge: 86400
    },
    resave: true,
    saveUninitialized: true
}));

///////////////////////////////////////////////////
// Assign cookies parser for express:
app.use(cookieParser());


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
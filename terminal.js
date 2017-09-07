"use strict";

var readline = require("readline");
var rl = readline.createInterface(process.stdin, process.stdout);
var prefix = "FileShare> ";


var quit = function() {
    console.log("Stopping server.");
    process.exit();
}

var set_cursor = function() {
    rl.setPrompt(prefix, prefix.length);
    rl.prompt();
}

rl.on("line", function(line) {
    line = line.trim();

    switch (line) {
        case "q":
            quit();
            break;
        case "quit":
            quit();
            break;
        default:
            console.error("Unreconised command '" + line + "'.");
            break;
    }

    set_cursor();
});


module.exports = set_cursor;
var REPL = require("repl");
var db = require("./models");

var repl = REPL.start(" simple-login > ");
repl.context.db = db;

repl.on("exit", function() {
	process.exit();
});
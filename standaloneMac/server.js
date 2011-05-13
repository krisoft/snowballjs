console.log("snowballjs starting up...");
var   osc=require('./lib/oscweb')
, path = require('path')
, root= (process.argv.length>2) ? process.argv[2] : path.dirname(__filename)
, server;

root = require("querystring").unescape(root);
server = osc.createServer({webRoot:root});
console.log("ready and serving");


var stdin = process.openStdin();
stdin.on("end", function () {	
	// so we lost our closest friend, I mean beside google
    process.exit(0);
});
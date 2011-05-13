var   osc=require('./lib/oscweb')
, path = require('path')
, root= (process.argv.length>2) ? process.argv[2] : path.dirname(__filename)
, server;
server = osc.createServer({webRoot:root});

var stdin = process.openStdin();
stdin.on("end", function () {	
	// so we lost our closest friend, I mean beside google
    process.exit(0);
});
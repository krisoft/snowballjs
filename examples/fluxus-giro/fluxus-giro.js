var   osc=require('../../lib/oscweb')
	, path = require("path")
	, root = path.join(path.dirname(__filename)
,"webroot")	, server;

console.log(root);
server = osc.createServer({webRoot: root});
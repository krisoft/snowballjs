var   osc=require('./lib/oscweb')
	, path = require('path')
	, root= __dirname
	, server;

server = osc.createServer({webRoot:root});
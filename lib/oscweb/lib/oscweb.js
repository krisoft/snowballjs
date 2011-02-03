var http = require('http')
  , url = require('url')
  , fs = require('fs')
  , io = require('../../socket.io')
  , paperboy = require('../../paperboy')
  , path = require('path')
  , WEBPORT = 8003
  , OSCPORT = 5678
  , WEBROOT = path.join(path.dirname(__filename), 'webroot');


exports.createServer=function(options){
	var webServer,ioServer
		, pools = {}
		, delegate = {};
	options = options || {};
	options.webPort = options.webPort || WEBPORT;
	options.oscPort = options.oscPort || OSCPORT;
	options.webRoot= options.webRoot || WEBROOT;
	
	webServer = http.createServer(function(req, res) {
	  var urlPath = url.parse(req.url).pathname;
	  if(urlPath=="/webOSC/osc.js"){
		  fs.readFile(path.join(WEBROOT,"osc.js"), function(err, data){
			if (err) return send404(res);
			res.writeHead(200, {'Content-Type': 'text/javascript'})
			res.write(data, 'utf8');
			res.end();
		  });
		  return;
	  }
	  paperboy
		.deliver(options.webRoot, req, res)
		.addHeader('Expires', 300)
		.addHeader('X-PaperRoute', 'Node')
	});
	webServer.listen( options.webPort );
	
	function send404(res){
	  res.writeHead(404);
	  res.write('404');
	  res.end();
	};
	
	ioServer = io.listen(webServer,{log:function(){}});
	
	function handleJoinMessage(message,id){
		var typeTag = message[1] || "";
		if(typeTag=="s"){
			var where = message[2];
			if(where){
				pools[where] = pools[where] || [];
				pools[where].push(id);
			};
		};
	};
	
	function sendMessage(to,message){
		if("w" in to){
			var client=ioServer.clientsIndex[ to.w ];
			if(client){
				client.send(JSON.stringify(message));
			}
		}
	}
	
	function dealWithMessage(message,id){
		var address = message[0] || "/webOSC/malformed";
		if(address=="/webOSC/join"){
			handleJoinMessage(message,id);
			return;
		}
		if(address in pools){
			for(k in pools[address]){
				sendMessage(pools[address][k],message);
			}
		}
	};
	
	ioServer.on('connection', function(client){
	  client.on('message', function(message){
	  	var message = JSON.parse(message);
	  	dealWithMessage(message,{'w':client.sessionId});
	  });
	});
	
};
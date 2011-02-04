var http = require('http')
  , url = require('url')
  , fs = require('fs')
  , io = require('../../socket.io')
  , osc = require('../../node-osc')
  , paperboy = require('../../node-paperboy')
  , path = require('path')
  , WEBPORT = 8003
  , OSCPORT = 5670
  , WEBROOT = path.join(path.dirname(__filename), 'webroot');


exports.createServer=function(options){
	var webServer,ioServer,oscServer
	    , oscClients={}
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
		if(typeTag=="si"){
			var where = message[2];
			var port = message[3];
			if(where && port && ("o" in id)){
				pools[where] = pools[where] || [];
				var clientId=id.o.address+":"+port;
				if(!(clientId in oscClients)){
					oscClients[clientId]= new osc.Client(port,id.o.address);
				}
				var alreadyThere=false;
				var pool=pools[where];
				for(k in pool){
					if(("o" in pool[k]) && (pool[k].o==clientId)){
						alreadyThere=true;
						break;
					}
				}
				if(!alreadyThere){
					pool.push({"o":clientId});
				}
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
		if("o" in to){
			var client=oscClients[ to.o ];
			if(client){
				client.sendSimple(message[0],message.slice(2),message[1]);
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
	
	oscServer = new osc.Server(options.oscPort);
	oscServer.onMessage(function(message,c){
		dealWithMessage(message,{'o':c});
	});
};
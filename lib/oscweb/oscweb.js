var io = require('../socket.io')
  , osc = require('../node-osc')
  , OSCPORT = 5670

exports.send = function(address,message){
				var type="";
				var m=[address,type];
				for (var k in message) {
					var data = message[k];
					m.push( data );
					if(typeof data == "string"){
						type+="s";
					}
					if(typeof data == "number"){
						if(Math.floor(data)==data){
							type+="i";
						}else{
							type+="f";
						}
					}
				}
				m[1]=type;
				socket.send( JSON.stringify( m ) );
}

exports.createServer=function(options){
	var webServer,ioServer,oscServer
	    , oscClients={}
		, pools = {}
		, delegate = {};
	options = options || {};
	options.oscPort = options.oscPort || OSCPORT;
	webServer = options.webServer || require("./webserver.js").createWebServer(options);
	
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
		if("s" in to){
			to.s(message);
		}
	}
	
	function dealWithMessage(message,id){
		var address = message[0] || "/snowballjs/malformed";
		console.log(address);
		if(address=="/snowballjs/join"){
			handleJoinMessage(message,id);
			return;
		}
		if(address in pools){
			for(k in pools[address]){
				sendMessage(pools[address][k],message);
			}
		}
	};
	
	ioServer = io.listen(webServer,{log:function(){}});
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
	return {
		send:function(address,message){
					var type="";
					var m=[address,type];
					for (var k in message) {
						var data = message[k];
						m.push( data );
						if(typeof data == "string"){
							type+="s";
						}
						if(typeof data == "number"){
							if(Math.floor(data)==data){
								type+="i";
							}else{
								type+="f";
							}
						}
					}
					m[1]=type;
					dealWithMessage(m,{});
			},
		listen:function(address,callback){
				pool.push({"s":callback});
			}
		};
};
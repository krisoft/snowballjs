var   osc=require('./lib/node-osc')
	, client,server;
	
server = new osc.Server(5679);
server.onMessage(function(m,s){
	console.log(m);
	console.log(s.address);
	server.close()
});

client = new osc.Client(5679);
client.sendSimple("/testelheto",[4,"hejho",3.14],"isf");
client.close()
console.log("done")
var   buffer = require('buffer')
	, dgram = require('dgram')
	, Message = require('./message.js').Message
	, jspack = require('../node-jspack/jspack.js').jspack;
	
var Server = function ( port ) {
  this.port = port || 5678;
  this._sock = dgram.createSocket("udp4");
  this._sock.bind(this.port);
  var server=this;
  this._sock.on("message", function (msg, rinfo) {
  	  var first,second;
  	  for(first = 0; msg[first] != 0 && first < msg.length; first++){};
  	  var address = msg.toString('ascii', 0, first);
  	  for(; msg[first] == 0 && first < msg.length; first++){};
  	  for(second=first+1; msg[second]!=0 && second<msg.length ;second++){};
  	  var typetag = msg.toString('ascii', first+1,second);
  	  
  	 
  	 var   data = [address,typetag]
  	 	 , p =  Math.ceil((second + 1) / 4.0) * 4
  	 	 , n = 0
  	 	 , packS;
  	 for(var i = 0; i < typetag.length; i++){
  	 	switch( typetag[i] )
		{
		case "i":
		  packS=">i";
		  data.push( jspack.Unpack(packS,msg,p)[0] );
		  n = jspack.CalcLength(packS);
		  break;
		 
		case "f":
		  packS=">f";
		  data.push( jspack.Unpack(packS,msg,p)[0] );
		  n = jspack.CalcLength(packS);
		  break;
		case "s":
		  var j;
		  for (j=p; msg[j]!=0 && j<msg.length;j++){}
		  data.push( msg.toString('utf8', p,j) );
		  n = j-p+1;
		  break;
		}
		n = Math.ceil((n) / 4.0) * 4;
		p += n;
  	  }
  	  if(server._message){
  	  	server._message(data,rinfo);
  	  }
	});
}
Server.prototype = {
  onMessage: function (f) {
  	this._message=f;
  },
  close: function (){
  	this._sock.close()
  }
}
exports.Server = Server;
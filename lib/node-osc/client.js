var   buffer = require('buffer')
	, dgram = require('dgram')
	, Message = require('./message.js').Message;
	
var Client = function ( port, host ) {
  this.port = port;
  this.host = host  || '127.0.0.1';
  this._sock = dgram.createSocket("udp4");
}
Client.prototype = {
  send: function (msg) {
    var binary = msg.toBinary();
    var b = new buffer.Buffer(binary, 'binary');
    this._sock.send(b, 0, b.length, this.port, this.host);
  },
  sendSimple: function (address, data,typetag) {
    var msg = new Message(address);
    msg.append(data,typetag);
    this.send(msg);
  },
  close: function (){
  	this._sock.close()
  }
}
exports.Client = Client;
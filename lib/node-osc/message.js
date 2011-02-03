
var	  sys = require('sys')
	, jspack = require('../node-jspack').jspack;


var Message = function (address) {
  this.address = address;
  this.typetags = ',';
  this.message = [];
}
Message.prototype = {
  append: function (arg, typehint) {
    if (arg instanceof Array) {
      if ((typeof(typehint)=="string") && (arg.length==typehint.length)){
      	  // so they most probably provided us a neat typetag like "ffis" or smthg
      	  for (var i in arg) {
			this.append(arg[i], typehint[i]);
		  }
      }else{
		  for (var i in arg) {
			this.append(arg[i], typehint);
		  }
      }
      return null;
    }
    if (typeof(arg) == 'object') {
      for (var k in arg) {
        this.append([k, arg[k]]);
      }
      return null;
    }
    
    if (typehint == 'b') {
      binary = OSCBlob(arg);
      tag = 'b';
    } else if (typehint == 't') {
      binary = OSCTimeTag(arg);
      tag = 't';
    } else {
      rv = OSCArgument(arg, typehint);
      tag = rv[0];
      binary = rv[1];
    }
    
    this.typetags += tag;
    this.message = this.message.concat(binary);
  },
  toBinary: function () {
    var binary = OSCString(this.address);
    binary = binary.concat(OSCString(this.typetags));
    binary = binary.concat(this.message);
    return binary;
  },
}
exports.Message = Message;


var Bundle = function (address, time) {
  Message.call(this, address);
  this.timetag = time || 0;
}
sys.inherits(Bundle, Message);
Bundle.prototype.append = function (arg, typehint) {
  var binary;
  if (arg instanceof Message) {
    binary = OSCBlob(arg.toBinary());
  } else {
    var msg = Message(this.address);
    if (typeof(arg) == 'Object') {
      if (arg.addr) {
        msg.address = arg.addr;
      }
      if (arg.args) {
        msg.append(arg.args, typehint);
      }
    } else {
      msg.append(arg, typehint);
    }
    binary = OSCBlob(msg.toBinary());
  }
  this.message += binary;
  this.typetags += 'b';
};
Bundle.prototype.toBinary = function () {
  var binary = OSCString('#bundle');
  binary = binary.concat(OSCTimeTag(this.timetag));
  binary = binary.concat(this.message);
  return binary;
};
exports.Bundle = Bundle;


var OSCString = function (next) {
  next=new Buffer(next,"utf8")
  var len = Math.ceil((next.length + 1) / 4.0) * 4;
  return jspack.Pack('>' + len + 's', [next]);
}


var OSCBlob = function (next) {
  var binary;
  if (typeof(next) == 'String') {
    var len = Math.ceil((next.length) / 4.0) * 4;
    binary = jspack.Pack('>i' + len + 's', [len, next]);
  } else {
    binary = '';
  }
  return binary;
}


var OSCArgument = function (next, typehint) {
  var binary, tag;
  if (!typehint) {
    if (typeof(next) == 'number') {
      if (next.toString().indexOf('.') != -1) {
        binary = jspack.Pack('>f', [next]);
        tag = 'f';
      } else {
        binary = jspack.Pack('>i', [next]);
        tag = 'i';
      }
    } else {
      binary = OSCString(next);
      tag = 's';
    }
  } else if (typehint == 'f') {
    try {
      binary = jspack.Pack('>f', [parseFloat(next)]);
      tag = 'f';
    } catch (e) {
      binary = OSCString(next);
      tag = 's';
    }
  } else if (typehint == 'i') {
    try {
      binary = jspack.Pack('>i', [parseInt(next)]);
      tag = 'i';
    } catch (e) {
      binary = OSCString(next);
      tag = 's';
    }
  } else {
    binary = OSCString(next);
    tag = 's';
  }
  return [tag, binary];
}

var OSCTimeTag = function (time) {
  // Not Implemented Yet
  return jspack.Pack('>LL', 0, 1);
}




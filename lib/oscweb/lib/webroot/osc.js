var webOSC=function(){
	
	var socket = new io.Socket(null, {port: 8003, rememberTransport: false});
    socket.connect();
    
	var  message=[]
	    , type=""
	    , callbacks={}
	    , delegate={
			"send":function(address){
				var m=[address,type];
				for (var k in message) {
					m.push( message[k] );
				};
				socket.send( JSON.stringify( m ) );
				message=[];
				type="";
			}
			,"add":function(data){
				if(typeof data == "string"){
					message.push(data);
					type+="s";
				}
				if(typeof data == "number"){
					if(Math.floor(data)==data){						
						message.push(data);
						type+="i";
					}else
					{						
						message.push(data);
						type+="f";
					}
				}
			}
			,"listen":function(address,callback){
				callbacks[address]=callback;
				var join=["/webOSC/join","s",address];
      			socket.send(JSON.stringify(join));
			}
		};
		
    
    socket.on('message', function(m){
    	m = JSON.parse(m);
    	if( m[0] in callbacks){
    		var f=callbacks[ m[0] ];
    		f( m.slice(2) );
    	}
    });
    
	return delegate;
}();
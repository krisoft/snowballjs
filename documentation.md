# snowballjs - realtime-web, in a box #

It's a standalone server to develop realtime communicating web applications.

## Overview ##

You want to make a cool multiplayer game. Or remote control your teapot from the browser. Or just make a tiny chat application to share love-letters with your girlfriend. You just want to instances of the same webpage speak to each other. You can't even care less about the server, or nodejs, or socketIO, just just make it work. Then snowballjs is for you!

With snowballjs you can use a really simple API to subscribe or send messages to channels. It can even speak OSC if you know what i mean. If you don't, then don't worry me neither.

## Usage ##

1. download the application
2. start it
3. open the website (http://localhost:8002) and play with the attached examples
4. start your own project by modifying the boilerplate-project
5. did you reached the eternal joy and happiness? if not then goto 3. or 4. or eat a good sandwich


## Reference ##

Support for the realtime communication lives in the /snowballjs/snowball.js lib, so don't forget to link it.

	<script src="/snowballjs/snowball.js"></script>

-`snowball.add(data);`

 append `data` to the message buffer

-`snowball.send(channel);`

 sends a message to the `channel `, with the content of the message buffer.

-`snowball.listen(channel,callbackfunc);`

 start listening on `channel `, for any subsequent message aimed towards `channel ` will trigger `callbackfunc` with the content of the message as a parameter.

## Example ##

only the juicy parts here, full version attached as an example

	snowball.listen('/heartBeat',function(message){
		// Baaaaaaaaalint megvillantanad itt a szivet css animacioval? :)
		$("#messages").append( message );
	});
	snowball.add("<3");
	snowball.send("/heartBeat")

## Wait, did somebody said OSC? ##

You are right. If you know what OSC is, then you are reading the good part, otherwise you can safely ignore it.

So, you are still reading, which means you want to connect your favourite OSC enabled toy (processing, fluxus, vvvv, max-msp, whatever) to the web. With snowballjs, you CAN! :)

Because you can see, in snowballjs everything, from the message passing style, to the message format, is heavily influenced by the current ways-of-doing with OSC.

### OSC -> snowballjs ###

Aim your messages, according this:
- ip: ip of the computer running snowballjs
- port: 5670
- tag: whatever you want to use, will act as channel

All the clients listening to that channel will get it.

### snowballjs -> OSC ###

This is a bit more tricky, maybe we could make a graphical interface to set this up.
Currently if you want to subscribe to a channel with an osc client, then you have to send a carefully crafted OSC message, to
snowballjs. 
- ip: ip of the computer running snowballjs
- port: 5670
- tag: /snowballjs/listen
- content: a string with the channel name you wish to subscribe, and the port number you want to get your answers.

so the deal is: you subscribe, then snowballjs will send all the subsequential messages of that chanel for you too

## snowballjs in the wild ##

Snowballjs is designed to be a prototyping tool. It's permissive nature will route message from any participant to any other participant without any further questioning. Which is cool, if we live in the world of forever happines, but sadly it's not the case. To turn snowballjs from a peacfull hippie to a blastproof-concrete-wall consult with the code. (or with us :)) 
/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var Sockets = function() {};
var socketInstance;

Sockets.init = function(sio) {
	socketInstance = sio;
};

Sockets.sendMessage = function(event, data){
	socketInstance.sockets.emit(event, data);
};

module.exports = Sockets;
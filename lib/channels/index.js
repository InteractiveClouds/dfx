/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var PUBSUB = require('./event.js');


exports.channels = {
    root   : new PUBSUB.EventManager({debug: true}),
    logger : new PUBSUB.EventManager()
}

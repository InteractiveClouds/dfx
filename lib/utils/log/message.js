var getTime = require('./utils/gettime'),
    format  = require('./format');


var dir = __dirname.replace(/([()/\\.\[\]^$?|{}])/g, "\\$1"),
    cutThisLines = new RegExp( '[\\s\\S]+' + dir + '.+[\\n\\r]'),
    quantity = 0;


function Message ( o ) {
    this.level  = o.level;
    this.label  = o.label;
    this.time   = getTime();
    this.text   = o.text;
    this.number = ++quantity;
}

Message.fn = Message.prototype;

Message.fn.__defineGetter__('plainString', function () {
    return this._plainString ||
        ( this._plainString = format.plain(this) );
});

Message.fn.__defineGetter__('colorString', function () {
    return this._colorString ||
        ( this._colorString = format.color(this) );
});

Message.fn.__defineGetter__('stack', function () {
    return this.__stack ||
        ( this.__stack = new Error().stack.replace(cutThisLines, '') );
});

Message.fn.toString = function () {
    return this.text;
};


exports.Instance = Message;

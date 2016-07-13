var Fiber = require('fibers');

var current;
Fiber(function() {
    current = Fiber.current;
    Fiber.yield();
    console.log('pass');
}).run();

current.run();
console.log("end");

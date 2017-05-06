'use strinct'

var typeBuilder = require('./typeBuilder');
var signet = typeBuilder.signet;

var initialCond = 'initialCond';
var initialCondDuck = { cond: 'function' };
signet.defineDuckType(initialCond, initialCondDuck);


var when = signet.sign('function => initialCond', function (transformer) {

});

module.exports = function () {
    return when;
};
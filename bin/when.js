'use strinct'

var typeBuilder = require('./typeBuilder');
var signet = typeBuilder.signet;

var initialCond = 'initialCond';
var initialCondDuck = { cond: 'function' };
var conditionalBuilder = 'conditionalBuilder';

signet.defineDuckType(initialCond, initialCondDuck);
signet.defineDuckType(conditionalBuilder, { cond:'function', match:'function' });

module.exports = function () {

    var when = signet.sign('function => initialCond', function (transformer) {
        var conditions = [];

        var match = signet.sign('* => *', function (value) {
            var xformed = transformer(value)
            var found = conditions.find(function (condition) {
                return condition.condition(xformed);
            });

            if(typeBuilder.isUndefined(found))
            {
                return;
            }

            return found.action(value);
        });

        var cond = signet.sign('function, function => conditionalBuilder', function (condition, action){
            var trueCondition;
            if(signet.isTypeOf('string')) {
                trueCondition = signet.isTypeOf(condition);
            } else if (signet.isTypeOf('function')) {
                trueCondition = function(v) { Boolean(condition(v)); }
            } else {
                throw new Error("expect a predicate or type");
            }

            conditions.push({ condition: trueCondition, action: action});
            return {
                cond: cond,
                match: match
            };
        });

        return {
            cond: cond
        }
    });

    return when;
};
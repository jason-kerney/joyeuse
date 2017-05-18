'use strinct';

var typeBuilder = require('./typeBuilder');
var signet = typeBuilder.signet;

var initialCond = 'initialCond';
var initialCondDuck = { cond: 'function' };
var conditionalBuilder = 'conditionalBuilder';

signet.defineDuckType(initialCond, initialCondDuck);
signet.defineDuckType(conditionalBuilder, { cond:'function', match:'function' });

module.exports = function () {

    var when = signet.sign(typeBuilder.asFunctionalDefString(typeBuilder.asOptionalParameterDefString('function'), conditionalBuilder), function (transformer) {
        var conditions = [];

        var trueXformer = typeBuilder.isUndefined(transformer) ? function (item) { return item; } : transformer;

        var match = signet.sign('* => *', function (value) {
            var xformed = trueXformer(value);
            var found = conditions.find(function (condition) {
                return condition.condition(xformed);
            });

            if(typeBuilder.isUndefined(found))
            {
                return { warning: 'no condition was successful' };
            }

            return found.action(value);
        });

        var cond = signet.sign('function, function => conditionalBuilder', function (condition, action){
            var trueCondition;
            if(signet.isTypeOf('string')(condition)) {
                trueCondition = signet.isTypeOf(condition);
            } else
                if (signet.isTypeOf('function')) {
                trueCondition = function(v) { return Boolean(condition(v)); }
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
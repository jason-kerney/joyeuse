'use strict';

var typeBuilder = require('../bin/typeBuilder');
var signet = typeBuilder.signet;

function when(map) {
    var conditions = [];

    function match(value) {
        var xformed = map(value)
        var found = conditions.find(function (condition) {
            return condition.condition(xformed);
        });

        if(typeBuilder.isUndefined(found))
        {
            throw new Error("no conditions met");
        }

        found.execution(value);
    }

    function cond(condition, execution){
        var trueCondition;
        if(signet.isTypeOf('string')) {
            trueCondition = signet.isTypeOf(condition);
        } else if (signet.isTypeOf('function')) {
            trueCondition = function(v) { Boolean(condition(v)); }
        } else {
            throw new Error("expect a predicate or type");
        }

        conditions.push({ condition: trueCondition, execution: execution});
        return {
            cond: cond,
            match: match
        };
    }

    return {
            cond: cond
        }
}
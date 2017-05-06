'use strict';

/*
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

//*/

var assert = require('chai').assert;

var typeBuilder = require('../bin/typeBuilder');
var signet = typeBuilder.signet;
var sinon = require('sinon');
var approvalsConfig = require('./test-utils/approvalsConfig');
var approvals = require('approvals').configure(approvalsConfig).mocha('./tests/approvals');

describe('when', function () {
    var when;
    beforeEach(function () {
        when = require('../bin/when')();
    })

    it('should be a function that takes a function and returns a condition', function () {
        assert.equal(when.signature, 'function => initialCond');
    })

    it.skip('should call the transformer on match', function () {
        var transformer = sinon.spy();
        when(transformer)
            .cond(function (_) { return true; })
            .match(5);

        this.verify(JSON.stringify(transformer.args[0]) + '\r\n');
    })
})
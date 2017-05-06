'use strict';

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
    });

    it('should be a function that takes a function and returns a condition', function () {
        assert.equal(when.signature, 'function => initialCond');
    });

    it('should call the transformer on match', function () {
        var transformer = sinon.spy();
        when(transformer)
            .cond(function (_) {
                return true;
            }, function (_) {
            })
            .match(5);

        assert.equal(5, transformer.args[0][0]);
    });

    it('should call the first condition with the transformed value', function () {
        function transformer(_) {
            return "seven";
        }

        var actual;
        function spy(input) {
            actual = input;
            return false;
        };

        when(transformer).cond(spy, function (_) { }).match(5);

        assert.equal("seven", actual);
    });

    it('should call next item with transformer being called once', function () {
        var callCount = 0;
        function transformer(_) {
            callCount++;
            return "from transformer";
        }

        var actual;
        function spy(input) {
            actual = input;
            return false;
        }

        when(transformer)
            .cond(function (_) { return false; }, function (_) { })
            .cond(spy, function (_) { })
            .match(34);

        assert.equal(1, callCount, "the transformer was called too many times");
        assert.equal("from transformer", actual);
    });

    it('should not call the first action when condition returns false', function () {
        var callCount = 0;
        function action(_) {
            callCount++;
        }

        function transformer(input) {
            return input.toString();
        }

        when(transformer)
            .cond(function (_) { return true; }, action);

        assert.equal(0, callCount);
    });

    it('should call the first action when condition returns true', function () {
        var callCount = 0;
        var actual;
        function action(input) {
            actual = input;
            callCount++;
            return "done";
        }

        var result =
            when(function(input) { return { undone:false }; })
                .cond(function (_) { return true; }, action)
                .match(2);

        assert.equal(1, callCount, 'was not called exactly once');
        assert.equal(actual, 2, 'was called with wrong value');
        assert.equal("done", result, 'did not return correct result');
    });

    it('should not call the second action if the second condition is false', function () {
        var callCount = 0;
        function action(_) {
            callCount++;
        }

        when(function (input) { return { isPassing:"false" }; })
            .cond(function (_) { return false; }, function (_) { })
            .cond(function (_) { return false; }, action)
            .match("blarg");

        assert.equal(0, callCount);
    });

    it('should call the second action if the second condition is true', function () {
        var callCount = 0;
        var actual;
        function action(input) {
            callCount++;
            actual = input;
            return "yep done";
        }

        var result =
            when(function (input) { return { isPassing:"false" }; })
                .cond(function (_) { return false; }, function (_) { })
                .cond(function (_) { return true; }, action)
                .match("blarg");

        assert.equal(1, callCount, 'did not call the action the correct number of times');
        assert.equal("blarg", actual, 'did not get called with correct argument');
        assert.equal("yep done", result, 'did not return the correct value');
    });

    it('should call the first action when the transformer returns the correct type if the condition is a type string', function () {
        var callCount = 0;
        var actual;
        function action(input) {
            callCount++;
            actual = input;
            return "yep done";
        }

        var result =
            when(function (input) { return 5; })
                .cond('int', action)
                .match("hello world");

        assert.equal(1, callCount, 'did not get called the correct number of times');
        assert.equal("hello world", actual, 'did not get called correctly');
        assert.equal("yep done", result,'did not return the correct value');
    });

    it('should call the second action when the transformer returns the correct type if the condition is a type string', function () {
        var callCount = 0;
        var actual;
        function action(input) {
            callCount++;
            actual = input;
            return "yep done";
        }

        var result =
            when(function (input) { return 5; })
                .cond(function () { return false; }, function () { })
                .cond('int', action)
                .match("hello world");

        assert.equal(1, callCount, 'did not get called the correct number of times');
        assert.equal("hello world", actual, 'did not get called correctly');
        assert.equal("yep done", result,'did not return the correct value');
    });

    it('should not call the second action when the first action succeeds', function () {
        var callCount = 0;
        var actual;
        function action(input) {
            callCount++;
            actual = input;
            return "yep done";
        }

        var result =
            when(function (input) { return 5; })
                .cond(function () { return true; }, function () { return "first result"; })
                .cond('int', action)
                .match("hello world");

        assert.equal(0, callCount, 'did not get called the correct number of times');
        assert.equal("first result", result,'did not return the correct value');
    });
});
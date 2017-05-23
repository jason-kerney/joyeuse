'use strict';

const assert = require('chai').assert;
const typeBuilder = require('../bin/typeBuilder')();
const signet = typeBuilder.signet;
const sinon = require('sinon');
const approvalsConfig = require('./test-utils/approvalsConfig');
const approvals = require('approvals').configure(approvalsConfig).mocha('./tests/approvals');

describe('when', function () {
    var when;

    function spy(retValue) {
        return sinon.stub().returns(retValue);
    }

    beforeEach(function () {
        when = require('../bin/when')();
    });

    it('should be a function that takes a function and returns a condition', function () {
        this.verify(when.signature);
    });

    it('should call the transformer on match', function () {
        const transformer = sinon.spy();
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

        const condSpy = spy(false);
        when(transformer).cond(condSpy, function (_) { }).match(5);

        assert.isTrue(condSpy.withArgs("seven").calledOnce);
    });

    it('should call next item with transformer being called once', function () {
        const transformer = sinon.stub().returns("from transformer");
        const condSpy = sinon.stub().returns(false);

        when(transformer)
            .cond(function (_) { return false; }, function (_) { })
            .cond(condSpy, function (_) { })
            .match(34);

        assert.equal(1, transformer.callCount, "the transformer was called too many times");
        assert.isTrue(condSpy.withArgs("from transformer").calledOnce);
    });

    it('should not call the first action when condition returns false', function () {
        function transformer(input) {
            return input.toString();
        }

        const actionSpy = sinon.spy();

        when(transformer)
            .cond(function (_) { return false; }, actionSpy)
            .match(34);

        assert.isTrue(actionSpy.notCalled);
    });

    it('should call the first action when condition returns true', function () {
        const actionSpy = spy("done");
        const result =
            when(function (input) { return { undone: false }; })
                .cond(function (_) { return true; }, actionSpy)
                .match(2);

        assert.isTrue(actionSpy.calledWith(2).calledOnce, 'was not called exactly once with 2');
        assert.equal("done", result, 'did not return correct result');
    });

    it('should not call the second action if the second condition is false', function () {
        const actionSpy = spy(undefined);
        when(function (input) { return { isPassing: "false" }; })
            .cond(function (_) { return false; }, actionSpy)
            .cond(function (_) { return false; }, actionSpy)
            .match("blarg");

        assert.isTrue(actionSpy.notCalled);
    });

    it('should call the second action if the second condition is true', function () {
        const actionSpy = spy("yep done");
        const result =
            when(function (input) { return { isPassing: "false" }; })
                .cond(function (_) { return false; }, function (_) { })
                .cond(function (_) { return true; }, actionSpy)
                .match("blarg");

        assert.isTrue(actionSpy.calledWith("blarg").calledOnce, 'did not call the action the correct number of times');
        assert.equal("yep done", result, 'did not return the correct value');
    });

    it('should call the first action when the transformer returns the correct type if the condition is a type string', function () {
        const action = spy("yep done");

        const result =
            when(function (input) { return 5; })
                .cond('int', action)
                .match("hello world");

        assert.isTrue(action.calledWith("hello world").calledOnce, 'did not get called the correct number of times');
        assert.equal("yep done", result, 'did not return the correct value');
    });

    it('should call the second action when the transformer returns the correct type if the condition is a type string', function () {
        const actionSpy = spy("yep done");
        const result =
            when(function (input) { return 5; })
                .cond(function () { return false; }, function () { })
                .cond('int', actionSpy)
                .match("hello world");

        assert.isTrue(actionSpy.calledWith("hello world").calledOnce, 'did not get called the correct number of times');
        assert.equal("yep done", result, 'did not return the correct value');
    });

    it('should not call the second action when the first action succeeds', function () {
        const actionSpy = spy("yep done");
        const result =
            when(function (input) { return 5; })
                .cond(function () { return true; }, function () { return "first result"; })
                .cond('int', actionSpy)
                .match("hello world");

        assert.isTrue(actionSpy.notCalled, 'did not get called the correct number of times');
        assert.equal("first result", result, 'did not return the correct value');
    });

    it('should return a warning when all conditions fail', function () {

        const result =
            when(function (input) { return ""; })
                .cond(function () { return false; }, function () { return "bad1"; })
                .cond('int', function (_) { return "bad2"; })
                .match("hello world");

        this.verify(JSON.stringify(result) + '\r\n');
    });

    it('should evaluate a condition as truthy', function () {
        const result =
            when(function (input) { return ""; })
                .cond(function () { return "bob"; }, function () { return "truthy"; })
                .cond('int', function (_) { return "bad"; })
                .match("hello world");

        assert.equal("truthy", result);
    });

    it('should default to an identity transformer', function () {
        const condition = spy(false);

        when()
            .cond(condition, function () { })
            .match(77);

        assert.equal(condition.calledWith(77).calledOnce);
    });
});
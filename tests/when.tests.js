'use strict';
const approvalsConfig = require('./test-utils/approvalsConfig');
require('approvals').configure(approvalsConfig).mocha('./tests/approvals');

const assert = require('chai').assert;
// const typeBuilder = require('../bin/typeBuilder')();
// const signet = typeBuilder.signet;
const sinon = require('sinon');
// const pretyJson = require('./test-utils/pretyJson');

describe('when', function () {
    var when;

    function spy(retValue) {
        function fake() {
            return retValue;
        }

        return sinon.spy(fake);
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
            .cond(function () {
                return true;
            }, function () {
            })
            .match(5);

        assert.equal(5, transformer.args[0][0]);
    });

    it('should call the first condition with the transformed value', function () {
        function transformer() {
            return "seven";
        }

        const condSpy = spy(false);
        when(transformer).cond(condSpy, function () { }).match(5);

        assert.isTrue(condSpy.withArgs("seven").calledOnce);
    });

    it('should call next item with transformer being called once', function () {
        const transformer = sinon.stub().returns("from transformer");
        const condSpy = sinon.stub().returns(false);

        when(transformer)
            .cond(function () { return false; }, function () { })
            .cond(condSpy, function () { })
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
            .cond(function () { return false; }, actionSpy)
            .match(34);

        assert.isTrue(actionSpy.notCalled);
    });

    it('should call the first action when condition returns true', function () {
        const actionSpy = spy("done");
        const result =
            when(function () { return { undone: false }; })
                .cond(function () { return true; }, actionSpy)
                .match(2);

        assert.isTrue(actionSpy.calledWith(2), 'was not called with 2');
        assert.isTrue(actionSpy.calledOnce, 'was not called exactly once');
        assert.equal("done", result, 'did not return correct result');
    });

    it('should not call the second action if the second condition is false', function () {
        const actionSpy = spy(undefined);
        when(function () { return { isPassing: "false" }; })
            .cond(function () { return false; }, actionSpy)
            .cond(function () { return false; }, actionSpy)
            .match("blarg");

        assert.isTrue(actionSpy.notCalled);
    });

    it('should call the second action if the second condition is true', function () {
        const actionSpy = spy("yep done");
        const result =
            when(function () { return { isPassing: "false" }; })
                .cond(function () { return false; }, function (_) { })
                .cond(function () { return true; }, actionSpy)
                .match("blarg");

        assert.isTrue(actionSpy.calledWith("blarg"), 'did not call the action with original argument');
        assert.isTrue(actionSpy.calledOnce, 'did not call the action exactly once.');
        assert.equal("yep done", result, 'did not return the correct value');
    });

    it('should call the first action when the transformer returns the correct type if the condition is a type string', function () {
        const action = spy("yep done");

        const result =
            when(function () { return 5; })
                .cond('int', action)
                .match("hello world");

        assert.isTrue(action.calledWith("hello world"), 'did not get called with original argument');
        assert.isTrue(action.calledOnce, 'did not get called exactly once');
        assert.equal("yep done", result, 'did not return the correct value');
    });

    it('should call the second action when the transformer returns the correct type if the condition is a type string', function () {
        const actionSpy = spy("yep done");
        const result =
            when(function () { return 5; })
                .cond(function () { return false; }, function () { })
                .cond('int', actionSpy)
                .match("hello world");

        assert.isTrue(actionSpy.calledWith("hello world"), 'did not get called the original argument.');
        assert.isTrue(actionSpy.calledOnce, 'did not get called exactly once');
        assert.equal("yep done", result, 'did not return the correct value');
    });

    it('should not call the second action when the first action succeeds', function () {
        const actionSpy = spy("yep done");
        const result =
            when(function () { return 5; })
                .cond(function () { return true; }, function () { return "first result"; })
                .cond('int', actionSpy)
                .match("hello world");

        assert.isTrue(actionSpy.notCalled, 'did not get called the correct number of times');
        assert.equal("first result", result, 'did not return the correct value');
    });

    it('should return a warning when all conditions fail', function () {

        const result =
            when(function () { return ""; })
                .cond(function () { return false; }, function () { return "bad1"; })
                .cond('int', function () { return "bad2"; })
                .match("hello world");

        this.verify(JSON.stringify(result) + '\r\n');
    });

    it('should evaluate a condition as truthy', function () {
        const result =
            when(function () { return ""; })
                .cond(function () { return "bob"; }, function () { return "truthy"; })
                .cond('int', function () { return "bad"; })
                .match("hello world");

        assert.equal("truthy", result);
    });

    it('should default to an identity transformer', function () {
        const condition = spy(false);

        when()
            .cond(condition, function () { })
            .match(77);

        assert.isTrue(condition.calledWith(77), 'did not get called with the original argument.');
        assert.isTrue(condition.calledOnce, 'did not get called exactly once.');
    });
});

if (typeof global.runQuokkaMochaBdd === 'function') {
    runQuokkaMochaBdd();
}
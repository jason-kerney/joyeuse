'use strict';

const builder = require('../../bin/types/builder.error')();
const assert = require('chai').assert;

const approvalsConfig = require('../test-utils/approvalsConfig');
require('approvals').configure(approvalsConfig).mocha('./tests/approvals/types');


describe('Error Builder', function () {
    describe('toErrorMessage', function () {

        it('will be a signed function', function () {
            this.verify(builder.toErrorMessage.signature);
        });

        it('will convert signet errors to nice sentences', function () {
            this.verify(builder.toErrorMessage(["value", "Object", undefined]));
        });

        it('will convert signet errors to nice sentences with regart to values', function () {
            this.verify(builder.toErrorMessage(["name", "String", 42]));
        });

        it('will not work if incorrects number of arguments are passed', function () {
            assert.throws(() => builder.toErrorMessage(["name", "String"]));
        });
    });
});
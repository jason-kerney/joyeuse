'use strict';

const builder = require('../../bin/types/error.builder')();
const assert = require('chai').assert;

const approvalsConfig = require('../test-utils/approvalsConfig');
require('approvals').configure(approvalsConfig).mocha('./tests/approvals');


describe('Error Builder', function () {
    describe('toErrorMessage', function () {

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
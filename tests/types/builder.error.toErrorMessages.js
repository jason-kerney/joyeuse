'use strict';

const builder = require('../../bin/types/builder.error')();
const assert = require('chai').assert;

const approvalsConfig = require('../test-utils/approvalsConfig');
require('approvals').configure(approvalsConfig).mocha('./tests/approvals/types');

describe('Error Builder', function () {
    describe('toErrorMessages', function () {
        it('will combine an array of signet errors', function () {
            const errors = [['name', 'string', undefined], ['age', 'int', '3']];

            this.verify(JSON.stringify(builder.toErrorMessages(errors), null, 4));
        });

        it('will combine an array of three signet errors', function () {
            const errors = [['name', 'string', undefined], ['age', 'int', '3'], ['status', 'undefined', 2]];

            this.verify(JSON.stringify(builder.toErrorMessages(errors), null, 4));
        });

        it('will throw an exception if one of the values is incorrect', function () {
            const errors = [['name', 'string', undefined], ['age', '3'], ['status', 'undefined', 2]];

            assert.throws(()=> builder.toErrorMessages(errors));
        });

        it('will throw an exception if not passed an array of arrays', function () {
            const errors = ['name', 'string', undefined];

            assert.throws(()=> builder.toErrorMessages(errors));
        });

        it('will be a signed function', function () {
            this.verify(builder.toErrorMessages.signature)
        });
    });
});
'use strict';

var approvalsConfig = require('./test-utils/approvalsConfig');
var approvals = require('approvals').configure(approvalsConfig).mocha('./tests/approvals');
var typeBuilder = require('../bin/typeBuilder');
var ending = "\r\n";

function approveIt(context, value) {
    context.verify(value + ending);
}

describe('type builder', function () {
    describe('asVariant', function () {
        it('should return for a hard coded variant type', function () {
            this.verify(typeBuilder.asVariant('int; string'));
        });

        it('should return for an array of types', function () {
            this.verify(typeBuilder.asVariant('int', 'boolean', 'string'));
        });

        it('should return a bounded int with a min of 0 and a max of 100', function () {
            this.verify(typeBuilder.asBoundedInt(0, 100));
        });

        it('should return a bounded int with a min of 0 and a max of infinity', function () {
            this.verify(typeBuilder.asBoundedInt(0));
        });
    });
});
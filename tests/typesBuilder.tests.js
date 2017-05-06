'use strict';

var approvalsConfig = require('./test-utils/approvalsConfig');
var approvals = require('approvals').configure(approvalsConfig).mocha('./tests/approvals');
var typeBuilder = require('../bin/typeBuilder');
var ending = "\r\n";
var assert = require('chai').assert;

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

        it('should be able to classify undifinded as undefined', function () {
            assert.isTrue(typeBuilder.isUndefined(undefined));
        });

        it('should determine a string is not undefined', function () {
            assert.isFalse(typeBuilder.isUndefined(""));
        });

        it('should be able to create an untyped array type', function () {
            this.verify(typeBuilder.asArray());
        })

        it('should be able to create a type array type', function () {
            this.verify(typeBuilder.asArray('int'));
        });

        it('should be able to create a formatted string', function () {
            this.verify(typeBuilder.asFormattedString('.*'));
        });

        it('should be able to create an optional parameter', function () {
            this.verify(typeBuilder.asOptionalParameter('boolean'));
        });

        it('should be able to create an optional property as a veriant of undefined', function () {
            this.verify(typeBuilder.asOptionalProperty('string'));
        });

        it('should be able to create method types', function () {
            this.verify(typeBuilder.asMethod('string', 'int'));
        });

        it('should be able to create a method with multiple input parameters', function () {
            this.verify(typeBuilder.asMethod(['int', 'boolean', 'string'], '*'))
        })
    });
});
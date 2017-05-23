'use strict';

const approvalsConfig = require('./test-utils/approvalsConfig');
const approvals = require('approvals').configure(approvalsConfig).mocha('./tests/approvals');
const typeBuilder = require('../bin/typeBuilder')();
const ending = "\r\n";
const assert = require('chai').assert;

function approveIt(context, value) {
    context.verify(value + ending);
}

describe('type builder', function () {
    it('should return for a hard coded variant type', function () {
        this.verify(typeBuilder.asVariantDefString('int; string'));
    });

    it('should return for an array of types', function () {
        this.verify(typeBuilder.asVariantDefString('int', 'boolean', 'string'));
    });

    it('should return a bounded int with a min of 0 and a max of 100', function () {
        this.verify(typeBuilder.asBoundedIntDefString(0, 100));
    });

    it('should return a bounded int with a min of 0 and a max of infinity', function () {
        this.verify(typeBuilder.asBoundedIntDefString(0));
    });

    it('should be able to classify undifinded as undefined', function () {
        assert.isTrue(typeBuilder.isUndefined(undefined));
    });

    it('should determine a string is not undefined', function () {
        assert.isFalse(typeBuilder.isUndefined(""));
    });

    it('should be able to create an untyped array type', function () {
        this.verify(typeBuilder.asArrayDefString());
    })

    it('should be able to create a type array type', function () {
        this.verify(typeBuilder.asArrayDefString('int'));
    });

    it('should be able to create a formatted string', function () {
        this.verify(typeBuilder.asFormattedStringDefString('.*'));
    });

    it('should be able to create an optional parameter', function () {
        this.verify(typeBuilder.asOptionalParameterDefString('boolean'));
    });

    it('should be able to create an optional property as a veriant of undefined', function () {
        this.verify(typeBuilder.asOptionalPropertyDefString('string'));
    });

    it('should be able to create method types', function () {
        this.verify(typeBuilder.asFunctionalDefString('string', 'int'));
    });

    it('should be able to create a method with multiple input parameters', function () {
        this.verify(typeBuilder.asFunctionalDefString(['int', 'boolean', 'string'], '*'))
    })

    it('should be able to construct a string enum', function () {
        const enumType = typeBuilder.asStringEnum('hello', 'world', 'blue');
        this.verify(enumType);
        assert.isTrue(typeBuilder.signet.isTypeOf(enumType)('hello'));
        assert.isFalse(typeBuilder.signet.isTypeOf(enumType)('ahello'));
    });
});
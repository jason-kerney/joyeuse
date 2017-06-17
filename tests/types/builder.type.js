'use strict';

const approvalsConfig = require('../test-utils/approvalsConfig');
require('approvals').configure(approvalsConfig).mocha('./tests/approvals/types');

const assert = require('chai').assert;

const tb = require('../../bin/types/builder.types.js')();
const fn = tb.fn;

describe('type builder', function () {
    it('will build a tulpe of type int', function () {
        this.verify(tb.tupleOf('int'));
    });

    it('will build a tulpe of type string', function () {
        this.verify(tb.tupleOf('string'));
    });

    it('will build a tulpe of type string, int and object', function () {
        this.verify(tb.tupleOf(['string', 'int', 'object']));
    });

    it('will thow an error if tulpe of is called with invalid type', function () {
        assert.throws(() => tb.tupleOf('explooodie'));
    });

    it('will thow an error if tulpe of is called with an invalid type as part of an array', function () {
        assert.throws(() => tb.tupleOf(['string', 'explooodie', 'int']));
    });
    
    it('will build a variant of type undefined, string', function () {
        this.verify(tb.variantOf(['undefined', 'string']));
    });

    it('will build a variant of type single type number', function () {
        this.verify(tb.variantOf('number'));
    });

    it('will throw an error if variant is passen an invalid type', function () {
        assert.throws(() => tb.variantOf('bat type'));
    });

    it('will throw an error if variant is passen an invalid type as part of an array', function () {
        assert.throws(() => tb.variantOf(['string', 'bat type']));
    });

    it('will build an array of type undefined', function () {
        this.verify(tb.arrayOf('undefined'));
    });

    it('will throw an error if array of is given an invalid type', function () {
        assert.throws(() => tb.arrayOf('blarg'));
    });

    it('will build an array of type number', function () {
        this.verify(tb.arrayOf('number'));
    });

    it('will build a function type', function () {
        this.verify(fn('*').to('*'));
    });

    it('will build a functin with a string output', function () {
        this.verify(fn('*').to('string'));        
    });

    it('will build a function with a string input type and an int output type', function () {
        this.verify(fn('string').to('int'));        
    });

    it('will build a function with an input of int and string types and an object output type', function () {
        this.verify(fn(['int', 'string']).to('*'));        
    });

    it('will throw an exception if input is not a correct type name.', function () {
        assert.throws(() => fn('not a type'));
    });
});
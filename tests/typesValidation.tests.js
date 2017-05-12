'use strict';

var approvalsConfig = require('./test-utils/approvalsConfig');
var approvals = require('approvals').configure(approvalsConfig).mocha('./tests/approvals');
var typesValidation = require('../bin/typesValidation');
var pretyJson = require('./test-utils/pretyJson');

var assert = require('chai').assert;

describe('type validation builder', function () {
    describe.only('basic type error builder', function () {
        it('should return no error for a good type', function () {
            var errors = typesValidation.getErrors('myProperty', 'boolean', true);
            assert.lengthOf(errors, 0);
        });

        it('should return error for a bad type', function () {
            var errors = typesValidation.getErrors('myProperty', 'boolean', 'not a boolean');
            this.verify(pretyJson(errors));
        });

        it('should return error for a bad type {int}', function () {
            var errors = typesValidation.getErrors('myProperty', 'int', 'not an int');
            this.verify(pretyJson(errors));
        });

        it('should validate a boolean without a name', function () {
            var errors = typesValidation.getErrors('boolean', false);
            assert.lengthOf(errors, 0);
        });

        it('should return error for a bad type {int} without name', function () {
            var errors = typesValidation.getErrors('int', false);
            this.verify(pretyJson(errors));
        });

        it('should return error for a bad type for boolean without name', function () {
            var errors = typesValidation.getErrors('boolean', 'not a boolean');
            this.verify(pretyJson(errors));
        });

        it.only('should return no errors when a field of a propety does match its type', function () {
            var errors = typesValidation.getErrors({ aProperty: 'string' }, { aProperty: 'thingy' });
            assert.lengthOf(errors, 0);
        });

        it.only('should return errors when a field of a propety does not match its type', function () {
            var errors = typesValidation.getErrors('testObject', { aProperty: 'boolean' }, { aProperty: 'thingy' });
            this.verify(pretyJson(errors));
        });

        it.only('should return errors when multiple propeties do not match thier type', function () {
            var errors = typesValidation.getErrors('testObject', { aProperty: 'boolean', bProperty: 'int' }, { aProperty: 'thingy', bProperty: true });
            this.verify(pretyJson(errors));
        });

        it.only('should return errors when some propeties do not match thier type', function () {
            var errors = typesValidation.getErrors('testObject', { goodProperty: 'int', aProperty: 'boolean', bProperty: 'string' }, { goodProperty: 5, aProperty: 'thingy', bProperty: true });
            this.verify(pretyJson(errors));
        });

        it.only('should return errors for missing propeties', function () {
            var errors = typesValidation.getErrors('testObject', { goodProperty: 'int', aProperty: 'boolean', bProperty: 'string' }, { goodProperty: 5, aProperty: true });
            this.verify(pretyJson(errors));
        });

        it.only('should return errors for sub-objects', function () {
            var typeDef = {
                aProperty: 'boolean',
                bProperty: {
                    age: 'int'
                }
            };
            var value = {
                aProperty: true,
                bProperty: {
                    age: 'two'
                }
            };
            
            var errors = typesValidation.getErrors('testObject', typeDef, value);
            this.verify(pretyJson(errors));
        });
    });
});
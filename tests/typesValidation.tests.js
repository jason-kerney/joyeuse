'use strict';

const typeBuilder = require('../bin/typeBuilder')();
const types = require('../bin/types')();
const typeNames = types.typeNames;
const approvalsConfig = require('./test-utils/approvalsConfig');
const approvals = require('approvals').configure(approvalsConfig).mocha('./tests/approvals');
const typesValidation = require('../bin/typesValidation')();
const pretyJson = require('./test-utils/pretyJson');

const assert = require('chai').assert;

describe('type validation builder', function () {
    describe('basic type error builder', function () {
        it('should return no error for a good type', function () {
            const errors = typesValidation.getErrors('myProperty', 'boolean', true);
            assert.lengthOf(errors, 0);
        });

        it('should return error for a bad type', function () {
            const errors = typesValidation.getErrors('myProperty', 'boolean', 'not a boolean');
            this.verify(pretyJson(errors));
        });

        it('should return error for a bad type {int}', function () {
            const errors = typesValidation.getErrors('myProperty', 'int', 'not an int');
            this.verify(pretyJson(errors));
        });

        it('should validate a boolean without a name', function () {
            const errors = typesValidation.getErrors('boolean', false);
            assert.lengthOf(errors, 0);
        });

        it('should return error for a bad type {int} without name', function () {
            const errors = typesValidation.getErrors('int', false);
            this.verify(pretyJson(errors));
        });

        it('should return error for a bad type for boolean without name', function () {
            const errors = typesValidation.getErrors('boolean', 'not a boolean');
            this.verify(pretyJson(errors));
        });

        it('should return no errors when a field of a propety does match its type', function () {
            const errors = typesValidation.getErrors({ aProperty: 'string' }, { aProperty: 'thingy' });
            assert.lengthOf(errors, 0);
        });

        it('should return errors when a field of a propety does not match its type', function () {
            const errors = typesValidation.getErrors('testObject', { aProperty: 'boolean' }, { aProperty: 'thingy' });
            this.verify(pretyJson(errors));
        });

        it('should return errors when multiple propeties do not match thier type', function () {
            const errors = typesValidation.getErrors('testObject', { aProperty: 'boolean', bProperty: 'int' }, { aProperty: 'thingy', bProperty: true });
            this.verify(pretyJson(errors));
        });

        it('should return errors when some propeties do not match thier type', function () {
            const errors = typesValidation.getErrors('testObject', { goodProperty: 'int', aProperty: 'boolean', bProperty: 'string' }, { goodProperty: 5, aProperty: 'thingy', bProperty: true });
            this.verify(pretyJson(errors));
        });

        it('should return errors for missing propeties', function () {
            const errors = typesValidation.getErrors('testObject', { goodProperty: 'int', aProperty: 'boolean', bProperty: 'string' }, { goodProperty: 5, aProperty: true });
            this.verify(pretyJson(errors));
        });

        it('should return errors for sub-objects', function () {
            const typeDef = {
                aProperty: 'boolean',
                bProperty: {
                    age: 'int'
                }
            };
            const value = {
                aProperty: true,
                bProperty: {
                    age: 'two'
                }
            };

            const errors = typesValidation.getErrors('testObject', typeDef, value);
            this.verify(pretyJson(errors));
        });

        it('should return errors for constuctor when connection object has a bad host and invalid client.', function () {
            const connectionObjectDef = {
                host: typeBuilder.asOptionalPropertyDefString(typeNames.ip4.format),
                socketPath: typeBuilder.asOptionalPropertyDefString(typeNames.path),
                user: typeNames.requiredString,
                password: typeBuilder.asOptionalPropertyDefString(typeNames.requiredString),
                database: typeNames.requiredString,
            };

            const constructorDef = {
                client: typeNames.knex.clients,
                connection: connectionObjectDef,
                searchPath: typeBuilder.asOptionalPropertyDefString(typeNames.requiredString),
                debug: typeBuilder.asOptionalPropertyDefString('boolean'),
                acquireConnectionTimeout: typeBuilder.asOptionalPropertyDefString(typeBuilder.asBoundedIntDefString(0)),
            };


            const connectionObject = {
                host: "10.12.13",
                user: "some_user",
                password: "12345",
                database: "default",
            };

            const constructor = {
                client: "access",
                connection: connectionObject,
            }

            const errors = typesValidation.getErrors('constructor', constructorDef, constructor);
            this.verify(pretyJson(errors));
        });
    });
});
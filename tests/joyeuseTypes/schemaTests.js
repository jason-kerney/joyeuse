'use strict';

const approvalsConfig = require('../test-utils/approvalsConfig');
const approvals = require('approvals').configure(approvalsConfig).mocha('./tests/approvals');
const pretyJson = require('../test-utils/pretyJson');
const assert = require('chai').assert;
const typeBuilder = require('../../bin/typeBuilder')();
const signet = typeBuilder.signet;

const typesFactory = require('../../bin/types');
const types = typesFactory();
const typeNames = types.typeNames;
const ip4Types = types.ip4;

const tables = types.joyeuse.tables;

describe('schema definition', function () {
    const joySchema = types.joyeuse.schema;
    var type;

    beforeEach(function () {
        type = tables.getColumnDefinitionBuilder();
    });

    it('should validate correctly with a name and one table', function () {
        const schema = {
            schemaName: 'testSchema',
            people: tables.table({
                tableName: 'People',
                dbQueryColumns: false,
                key: ['id'],
                id: type('int'),
            })
        };

        assert.isTrue(joySchema.validateSchema(schema), pretyJson(joySchema.getErrors(schema)));
    });

    it('should not validate a schema with a bad table', function () {
        const schema = {
            schemaName: 'testSchema',
            people: {
                tableName: 'People',
                dbQueryColumns: false,
                key: ['id'],
            }
        };

        const errors = pretyJson(joySchema.getErrors(schema));
        assert.isFalse(joySchema.validateSchema(schema), errors);
        this.verify(errors);
    });

    it('should not validate a schema without a table', function () {
        const schema = {
            schemaName: 'testSchema',
        };

        const errors = pretyJson(joySchema.getErrors(schema));
        assert.isFalse(joySchema.validateSchema(schema), errors);
        this.verify(errors);
    });
});
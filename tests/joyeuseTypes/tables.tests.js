'use strict';
const approvalsConfig = require('../test-utils/approvalsConfig');
require('approvals').configure(approvalsConfig).mocha('./tests/approvals');

const pretyJson = require('../test-utils/pretyJson');
const assert = require('chai').assert;
// const typeBuilder = require('../../bin/typeBuilder')();
// const signet = typeBuilder.signet;

const typesFactory = require('../../bin/types');
const types = typesFactory();
// const typeNames = types.typeNames;
// const ip4Types = types.ip4;

const tables = types.joyeuse.tables;

describe('table definiton', function () {
    var type;

    beforeEach(function () {
        type = tables.getColumnDefinitionBuilder();
    });

    it('should validate a good table definintion with 1 key, 1 column no dbQuery, and 2 defined relations', function () {
        const table = {
            tableName: 'device',
            dbQueryColumns: false,
            key: ['id'],
            id: type('int'),
            relations: [
                `MyDevice.id *-> MyUser.deviceId`,
                `MyDevice.id *-> Records.deviceId`
            ]
        };

        assert.isTrue(tables.isTableDefinition(table), tables.getTableDefinitinTypeErrors(table));
    });

    it('should validate a good definintion with 1 key, 1 column no dbQuery and no defined relations', function () {
        const table = {
            tableName: 'device',
            dbQueryColumns: false,
            key: ['id'],
            id: type('int')
        };

        assert.isTrue(tables.isTableDefinition(table), tables.getTableDefinitinTypeErrors(table));
    });

    it('should validate a good definintion with 1 key, 1 column no dbQuery and no defined relations', function () {
        const table = {
            tableName: 'device',
            dbQueryColumns: false,
            key: ['id'],
            id: type('int')
        };

        assert.isTrue(tables.isTableDefinition(table), tables.getTableDefinitinTypeErrors(table));
    });

    it('should validate a good definintion with no key, 1 column as a type string no dbQuery and no defined relations', function () {
        const table = {
            tableName: 'emails',
            dbQueryColumns: false,
            key: [],
            id: 'string'
        };

        assert.isTrue(tables.isTableDefinition(table), pretyJson(tables.getTableDefinitinTypeErrors(table)));
    });

    it('should show errors for a definintion without a key defined', function () {
        const table = {
            tableName: 'device',
            dbQueryColumns: false,
            id: type('int')
        };

        assert.isFalse(tables.isTableDefinition(table), pretyJson(tables.getTableDefinitinTypeErrors(table)));
        this.verify(pretyJson(tables.getTableDefinitinTypeErrors(table)));
    });

    it('should show errors for a definintion without any columns and no dbQuery', function () {
        const table = {
            tableName: 'device',
            dbQueryColumns: false,
            key: []
        };

        assert.isFalse(tables.isTableDefinition(table), pretyJson(tables.getTableDefinitinTypeErrors(table)));
        this.verify(pretyJson(tables.getTableDefinitinTypeErrors(table)));
    });

    it('should validate for a definintion without any columns and dbQuery', function () {
        const table = {
            tableName: 'device',
            dbQueryColumns: true,
            key: []
        };

        assert.isTrue(tables.isTableDefinition(table), pretyJson(tables.getTableDefinitinTypeErrors(table)));
    });

    it('should show errors for a definintion a key that is not a column and no dbQuery', function () {
        const table = {
            tableName: 'device',
            dbQueryColumns: false,
            key: ['id'],
            name: type('string')
        };

        assert.isFalse(tables.isTableDefinition(table), pretyJson(tables.getTableDefinitinTypeErrors(table)));
        this.verify(pretyJson(tables.getTableDefinitinTypeErrors(table)));
    });

    it('should return the table if table is called with a valid table', function () {
        const table = {
            tableName: 'device',
            dbQueryColumns: false,
            key: ['id'],
            id: type('int')
        };

        this.verify(pretyJson(tables.table(table)));
    });

    it('should fail a definintion with 1 key, 1 column no dbQuery, 1 incorrectly defined relation', function () {
        const table = {
            tableName: 'device',
            dbQueryColumns: false,
            key: ['id'],
            id: type('int'),
            relations: [
                `MyDevice *-> MyUser.deviceId`,
                `MyDevice.id *-> Records.deviceId`
            ]
        };

        const errors = pretyJson(tables.getTableDefinitinTypeErrors(table));
        assert.isFalse(tables.isTableDefinition(table), errors);
        this.verify(errors);
    });

    it('should fail a definintion with 1 key, 1 column no dbQuery, and 2 defined relations but one relation does not contain a valid column.', function () {
        const table = {
            tableName: 'device',
            dbQueryColumns: false,
            key: ['id'],
            id: type('int'),
            relations: [
                `MyDevice.nameId *-> Names.Id`,
                `MyDevice.id *-> Records.deviceId`
            ]
        };

        const errors = pretyJson(tables.getTableDefinitinTypeErrors(table));
        assert.isFalse(tables.isTableDefinition(table), errors);
        this.verify(errors);
    });

    it('should thow a nice error when table is called and given a definintion without a key defined', function () {
        const table = {
            tableName: 'device',
            dbQueryColumns: false,
            id: type('int')
        };

        var err;
        try {
            tables.table(table);
        } catch (error) {
            err = error.message;
        }

        this.verify(pretyJson(err));
    });

    it('should not validate a good definintion if it has extra properties', function () {
        const table = {
            tableName: 'device',
            dbQueryColumns: false,
            key: ['id'],
            id: 'int',
            relations: [
                `MyDevice.id *-> MyUser.deviceId`
            ],
            comment_For_Developer: 'This is not a valid member of a table',
            transformer: function (value) {
                return String(value).length;
            }
        };

        const errors = pretyJson(tables.getTableDefinitinTypeErrors(table));
        assert.isFalse(tables.isTableDefinition(table), errors);
        this.verify(errors);
    });
});

if (typeof global.runQuokkaMochaBdd === 'function') {
    runQuokkaMochaBdd();
}
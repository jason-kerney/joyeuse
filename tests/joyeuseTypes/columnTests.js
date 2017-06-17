'use strict';

const pretyJson = require('../test-utils/pretyJson');
const assert = require('chai').assert;
const typeBuilder = require('../../bin/typeBuilder')();
const signet = typeBuilder.signet;

const typesFactory = require('../../bin/types');
const types = typesFactory();
const typeNames = types.typeNames;
const ip4Types = types.ip4;

const tables = types.joyeuse.tables;

describe('column definition', function () {
    require('../test-utils/approvalsConfig');
    const joy = types.joyeuse.tables;
    it('should contain a definition type', function () {
        this.verify(pretyJson(joy.columnDefinitionType));
    });

    it('should validate a good deffinition', function () {
        const columnDefinition = {
            name: "ProductName",
            type: 'int',
            flags: ["readonly"],
        };

        assert.isTrue(joy.isJoyeuseColumnDefinition(columnDefinition));
    });

    it('should be able to give good errors', function () {
        const columnDefinition = {
            type: 'numberThingy',
            flags: ["helpful"],
        };

        this.verify(pretyJson(joy.getColumnDefinitionTypeErrors(columnDefinition)));
    });

    it('should be have a definition builder that takes a type name', function () {
        const columnBuilder = joy.getColumnDefinitionBuilder();
        const columnDef = columnBuilder('int');
        this.verify(pretyJson(columnDef));
    });

    it('should be have a definition builder that takes a type name - boolean', function () {
        const columnBuilder = joy.getColumnDefinitionBuilder();
        const columnDef = columnBuilder('boolean');
        this.verify(pretyJson(columnDef));
    });

    it('should be have a definition builder that can be made readonly', function () {
        const columnBuilder = joy.getColumnDefinitionBuilder();
        const columnDef = columnBuilder('int').readonly();
        this.verify(pretyJson(columnDef));
    });

    it('should be have a column builder that can be made hidden', function () {
        const columnBuilder = joy.getColumnDefinitionBuilder();
        const columnDef = columnBuilder('boolean').hidden();
        this.verify(pretyJson(columnDef));
    });

    it('should be have a definition builder that can be made hidden then readonly', function () {
        const columnBuilder = joy.getColumnDefinitionBuilder();
        const columnDef = columnBuilder('boolean').hidden().readonly();
        this.verify(pretyJson(columnDef));
    });

    it('should be have a definition builder that can be made readonly then hidden', function () {
        const columnBuilder = joy.getColumnDefinitionBuilder();
        const columnDef = columnBuilder('boolean').readonly().hidden();
        this.verify(pretyJson(columnDef));
    });

    it('should be have a  definition builder that can be made readonly then readonly', function () {
        const columnBuilder = joy.getColumnDefinitionBuilder();
        const columnDef = columnBuilder('boolean').readonly().readonly();
        this.verify(pretyJson(columnDef));
    });

    it('should be have a definition builder that can be made hidden then hidden', function () {
        const columnBuilder = joy.getColumnDefinitionBuilder();
        const columnDef = columnBuilder('boolean').hidden().hidden();
        this.verify(pretyJson(columnDef));
    });

    it('should be have a definition builder that can be made hidden then hidden', function () {
        const columnBuilder = joy.getColumnDefinitionBuilder();
        const columnDef = columnBuilder('boolean').hidden().hidden();
        this.verify(pretyJson(columnDef));
    });

    it('should have a definition builder that init a type', function () {
        const columnBuilder = joy.getColumnDefinitionBuilder();

        var columnDef = columnBuilder('int');
        assert.isUndefined(columnBuilder.initFn);
        columnDef = columnDef.init(function () {
            return 2;
        });

        const result = columnDef.initFn();
        assert.equal(2, result);
    });

    it('should have a definition builder that init a type - boolean', function () {
        const columnBuilder = joy.getColumnDefinitionBuilder();

        var columnDef = columnBuilder('boolean');
        assert.isUndefined(columnBuilder.initFn);
        columnDef = columnDef.init(function () {
            return true;
        });

        const result = columnDef.initFn();
        assert.equal(true, result);
    });

    it('should have a definition that throws an error when it returns wrong type.', function () {
        const columnBuilder = joy.getColumnDefinitionBuilder();

        var columnDef = columnBuilder('int');
        assert.isUndefined(columnBuilder.initFn);
        columnDef = columnDef.init(function () {
            return "some thing";
        });

        const throwing = columnDef.initFn.bind(null);
        assert.throws(throwing, "Expected to return type of int");
    });

    it('should have a definition that throws an error when it returns wrong type. - boolean', function () {
        const columnBuilder = joy.getColumnDefinitionBuilder();

        var columnDef = columnBuilder('boolean');
        assert.isUndefined(columnBuilder.initFn);
        columnDef = columnDef.init(function () {
            return 4;
        });

        const throwing = columnDef.initFn.bind(null);
        assert.throws(throwing, "Expected to return type of boolean");
    });
});

if (typeof global.runQuokkaMochaBdd === 'function') {
    runQuokkaMochaBdd();
}
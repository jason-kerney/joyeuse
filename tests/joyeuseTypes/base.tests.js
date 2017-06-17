'use strict';

const pretyJson = require('../test-utils/pretyJson');
const assert = require('chai').assert;
const typeBuilder = require('../../bin/typeBuilder')();
const signet = typeBuilder.signet;

const typesFactory = require('../../bin/types');
const types = typesFactory();
const typeNames = types.typeNames;
const ip4Types = types.ip4;

describe('for joyeuse types', function () {
    require('../test-utils/approvalsConfig');
    const tables = types.joyeuse.tables;

    it('should have all column flags', function () {
        this.verify(JSON.stringify(tables.columnFlags, null, 4));
    });

    it('should validate [\'readonly\'] as valid columnFlags', function () {
        assert.isTrue(tables.isColumnFlag(['readonly']));
    });

    it('should validate [\'readonly\', \'readonly\'] as not valid columnFlags', function () {
        assert.isFalse(tables.isColumnFlag(['readonly', 'readonly']));
    });

    it('should validate all flags as being valid as a columnFlags', function () {
        assert.isTrue(tables.isColumnFlag(tables.columnFlags));
    })

    it('should correctly validate relationships', function () {
        const testCases = [
            ['oneToOne', 'Customer.Id -> WishList.CustomerId'],
            ['oneToMany', 'Customer.Id ->* Orders.CustomerId'],
            ['manyToOne', 'ZipCode.Id *-> Address.ZipCodeId'],
            ['manyToMany', 'Orders.Tag *->* Product.Tag']
        ];

        testCases.forEach(function (testCase) {
            assert.isTrue(signet.isTypeOf(typeNames.joyeuse.retlationsTypeDef)(testCase[1]), testCase[0] + ' "' + testCase[1] + '"');
        }, this);
    });
});

if(typeof global.runQuokkaMochaBdd === 'function') {
    runQuokkaMochaBdd();
}
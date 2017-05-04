'use strict';

var approvalsConfig = require('./test-utils/approvalsConfig');
var approvals = require('approvals').configure(approvalsConfig).mocha('./tests/approvals');

var assert = require('chai').assert;

function ipGenerator(max) {
    var values = [];

    function part() {
        return Math.floor(Math.random() * max);
    }

    for (var i = 0; i <= 10000; i++) {
        var part1 = part();
        var part2 = part();
        var part3 = part();
        var part4 = part();
        var isValid =
            part1 <= 255
            && part2 <= 255
            && part3 <= 255
            && part4 <= 255;

        values.push({
            ip: part1 + '.' + part2 + '.' + part3 + '.' + part4,
            isValid: isValid
        });
    }

    return values;
}

describe('joyeuse', function () {
    describe('type definitions', function () {

        var types = require('../bin/types');
        var ip4Types = types.ip4;

        it('should correctly validate ip4 strings', function () {
            var ips = ipGenerator(255 * 2);

            ips.forEach(function (element) {
                var check = ip4Types.isIp4String(element.ip);
                var message = check ? element.ip + " is recorded as valid" : element.ip + " is recorded as invalid";

                assert.equal(element.isValid, check, message);
            }, this);
        });

        it('should validate required strings', function () {
            var validString = "a";
            var spaceOnly = " ";
            var tabOnly = "\t";
            var undifinedString = undefined;
            var nullString = null;
            var emptyString = '';

            assert.isTrue(types.base.isRequiredString(validString), "a valid string should be valid");
            assert.isFalse(types.base.isRequiredString(spaceOnly), "a space is not a valid string");
            assert.isFalse(types.base.isRequiredString(tabOnly), "a tab is not a valid string");
            assert.isFalse(types.base.isRequiredString(undifinedString), "undifined is not a valid string");
            assert.isFalse(types.base.isRequiredString(nullString), "null is not a valid string");
            assert.isFalse(types.base.isRequiredString(emptyString), "an empty string is not a valid string");
        });
    });
});
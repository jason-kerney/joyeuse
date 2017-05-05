'use strict';

var approvalsConfig = require('./test-utils/approvalsConfig');
var approvals = require('approvals').configure(approvalsConfig).mocha('./tests/approvals');
var signetConfig = require('../bin/signetConfig');


describe('signet config', function () {
    describe('asVariant', function () {
        it('should return for a hard coded variant type', function () {
            this.verify(signetConfig.asVariant('int; string'));
        });
        it('should return for an array of types', function () {
            this.verify(signetConfig.asVariant('int', 'boolean', 'string'));
        });
    });
});
'use strict';

var approvalsConfig = require('./test-utils/approvalsConfig');
var approvals = require('approvals').configure(approvalsConfig).mocha('./tests/approvals');
var typeBuilder = require('../bin/typeBuilder');


describe('type builder', function () {
    describe('asVariant', function () {
        it('should return for a hard coded variant type', function () {
            this.verify(typeBuilder.asVariant('int; string'));
        });
        
        it('should return for an array of types', function () {
            this.verify(typeBuilder.asVariant('int', 'boolean', 'string'));
        });
    });
});
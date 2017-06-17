'use strict';
const signet = require('../../bin/types/loader.signet')();
const tb = require('./builder.types')();

const fn = tb.fn;
const tupleOf = tb.tupleOf;

const toErrorMessage = signet.enforce(fn(tupleOf(['string', 'string', '*'])).to('*'), function (triplet) {
    const name = triplet[0];
    const expectedType = triplet[1];
    const value = triplet[2];
    const actualType = typeof (value);

    return "'" + name + "' was expected to be of type " + expectedType + " but was type " + actualType + " with value of '" + String(value) + "'";
});

module.exports = function () {
    return {
        toErrorMessage: toErrorMessage,
    };
};
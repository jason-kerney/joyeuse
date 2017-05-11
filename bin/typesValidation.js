'use strict';
var typeBuilder = require('./typeBuilder');
var signet = typeBuilder.signet;

function getErrors() {
    var hasAllArguments = arguments.length === 3;

    var typeNameIndex = hasAllArguments ? 1 : 0;
    var valueIndex = hasAllArguments ? 2 : 1;

    var propertyName = hasAllArguments ? arguments[0] : '';
    var typeName = arguments[typeNameIndex];
    var value = arguments[valueIndex]
    ;
    var isType = signet.isTypeOf(typeName)(value);
    if (isType) {
        return [];
    } else {
        return [
            {
                property_name: propertyName,
                type: typeName,
                value_given: value,
            }
        ];
    }
}

module.exports = {
    getErrors: getErrors,
}
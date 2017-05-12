'use strict';
var typeBuilder = require('./typeBuilder');
var signet = typeBuilder.signet;

function getBasicErrors(propertyName, typeInfo, value, errors) {
    var isType = signet.isTypeOf(typeInfo)(value);
    if (isType) {
        return errors;
    } else {
        var newErrors = errors.slice();
        newErrors.push(
            {
                property_name: propertyName,
                type: typeInfo,
                value_given: String(value),
            }
        );
        return newErrors;
    }
}

function getObjectErrors(propertyName, typeInfo, value, errors) {
    var newErrors = errors.slice();
    (Object.keys(typeInfo)).forEach(function(key) {
        var subName = propertyName + '.' + key;
        var subType = typeInfo[key];
        var subValue = value[key];

        var subErrors = getErrors(subName, subType, subValue);

        for (var index = 0; index < subErrors.length; index++) {
            var error = subErrors[index];
            newErrors.push(error);
        }
    }, this);

    return newErrors;
}

function getErrors() {
    var hasAllArguments = arguments.length === 3;

    var typeNameIndex = hasAllArguments ? 1 : 0;
    var valueIndex = hasAllArguments ? 2 : 1;

    var propertyName = hasAllArguments ? arguments[0] : '';
    var typeInfo = arguments[typeNameIndex];
    var value = arguments[valueIndex];

    if (typeof typeInfo === 'object') {
        return getObjectErrors(propertyName, typeInfo, value, [])
    }

    return getBasicErrors(propertyName, typeInfo, value, []);
}

module.exports = {
    getErrors: getErrors,
}
'use strict';
const typeBuilder = require('./typeBuilder')();
const signet = typeBuilder.signet;

function typeError(name, typeInfo, value) {
    return {
        property_name: name,
        type: typeInfo,
        value_given: typeBuilder.isUndefined(value) ? String(value) : value
    };
}

function getBasicErrors(propertyName, typeInfo, value, errors) {
    const isType = signet.isTypeOf(typeInfo)(value);
    if (isType) {
        return errors;
    } else {
        const newErrors = errors.slice();
        newErrors.push(typeError(propertyName, typeInfo, value));
        return newErrors;
    }
}

function getObjectErrors(propertyName, typeInfo, value, errors) {
    var newErrors = errors.slice();
    (Object.keys(typeInfo)).forEach(function (key) {
        const subName = propertyName + '.' + key;
        const subType = typeInfo[key];
        const subValue = value[key];

        const subErrors = getErrors(subName, subType, subValue);

        newErrors = newErrors.concat(subErrors);
    }, this);

    return newErrors;
}

function getErrors() {
    const hasAllArguments = arguments.length === 3;

    const typeNameIndex = hasAllArguments ? 1 : 0;
    const valueIndex = hasAllArguments ? 2 : 1;

    const propertyName = hasAllArguments ? arguments[0] : '';
    const typeInfo = arguments[typeNameIndex];
    const value = arguments[valueIndex];

    if (typeof typeInfo === 'object') {
        return getObjectErrors(propertyName, typeInfo, value, [])
    }

    return getBasicErrors(propertyName, typeInfo, value, []);
}

module.exports = function () {
    return {
        constructTypeError: typeError,
        getErrors: getErrors,
    };
}
'use strict';
const signet = require('../../bin/types/loader.signet')();

const typeName = 'type_name';

const isString = signet.isTypeOf('string');
signet.subtype('type')(typeName, isString);
const isArrayOfTypes = signet.isTypeOf('array<' + typeName + '>');

function generic(name, params) {
    function combine(types) {
        return name + '<' + types + '>';
    }
    if (isArrayOfTypes(params)) {
        return combine(params.join('; '));
    }

    return combine(params);
}

const arrayOf = signet.enforce(typeName + ' => ' + typeName, function (type) {
    return generic('array', type);
});

const variantOf = signet.enforce('variant<' + typeName + '; ' + arrayOf(typeName) + '> => ' + typeName, function (type) {
    return generic('variant', type);    
});

const tupleOf = signet.enforce(variantOf([typeName, arrayOf(typeName)]) + ' => ' + typeName, function (type) {
    return generic('tuple', type);
});

const functionBuilderToTypeDef = {
    to: 'function'
}
signet.defineDuckType('function_to', functionBuilderToTypeDef);

const fn = signet.enforce(variantOf([typeName, arrayOf(typeName)]) + " => function_to", function (inputType) {
    const function_to = signet.enforce(typeName + ' => string', function (outputType) {
        return inputType + " => " + outputType;
    });

    const builder = {
        to: function_to,
    };

    return builder;
});

module.exports = function () {
    return {
        fn: fn,
        arrayOf: arrayOf,
        variantOf: variantOf,
        tupleOf: tupleOf,
    };
}
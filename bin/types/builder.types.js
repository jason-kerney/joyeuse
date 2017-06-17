'use strict';
const signet = require('../../bin/types/loader.signet')();

const typeName = 'type_name';

const isString = signet.isTypeOf('string');
signet.subtype('type')(typeName, isString);

const arrayOf = signet.enforce(typeName + ' => ' + typeName, function (type) {
    return 'array<' + type + '>';
});

const isArrayOfTypes = signet.isTypeOf(arrayOf(typeName));
const variantOf = signet.enforce('variant<' + typeName + '; ' + arrayOf(typeName) + '> => ' + typeName, function (type) {
    if (isArrayOfTypes(type)) {
        return 'variant<' + type.join('; ') + '>';
    }

    return 'variant<' + type + '>';    
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
    };
}
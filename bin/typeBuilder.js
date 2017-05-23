'use strict';

const signet = require('signet')();

const isUndefined = signet.isTypeOf('undefined');

const asFunctionDefString = signet.enforce('variant<string; array<string>> => string',
    function (input, output) {
        if (signet.isTypeOf('string')(input)) {
            return input + ' => ' + output;
        } else {
            return input.join(", ") + ' => ' + output;
        }
    });

const typedString = signet.enforce(asFunctionDefString('string', 'string'),
    function (name, typeString) {
        return name + '<' + typedString + '>';
    });

const asVariantDefString = signet.enforce(asFunctionDefString('string', 'string'),
    function () {
        const args = Array.prototype.slice.call(arguments);
        if (!(signet.isTypeOf('array<string>'))) {
            throw new Error("all parrameters need to be of type'string'");
        }

        return 'variant<' + args.join('; ') + '>'
    });

const asBoundedIntDefString = signet.enforce(asFunctionDefString('int, [int]', 'string'),
    function (min, max) {
        const realMax = isUndefined(max) ? Infinity : max;
        return 'boundedInt<' + min + ';' + realMax + '>';
    });

const asArrayDefString = signet.enforce(asFunctionDefString(asVariantDefString('undefined', 'string'), 'string'),
    function (typeString) {
        const arrayName = 'array';
        if (isUndefined(typeString)) {
            return arrayName;
        }
        return arrayName + '<' + typeString + '>';
    });

const asFormattedStringDefString = signet.enforce(asFunctionDefString('string', 'string'),
    function (format) {
        return 'formattedString<' + format + '>';
    });

const asOptionalParameterDefString = signet.enforce(asFunctionDefString('string', 'string'),
    function (typestring) {
        return '[' + typestring + ']';
    });

const asOptionalPropertyDefString = signet.enforce(asFunctionDefString('string', 'string'), asVariantDefString.bind(null, 'undefined'));

const asStringEnum = signet.enforce(asFunctionDefString('string', 'string'), function () {
    const args = Array.prototype.slice.call(arguments);
    if (!(signet.isTypeOf('array<string>'))) {
        throw new Error("all parrameters need to be of type'string'");
    }

    return asFormattedStringDefString('^(' + args.join('|') + ')$');
});

module.exports = function () {
    return {
        signet: signet,
        isUndefined: isUndefined,
        asArrayDefString: asArrayDefString,
        asVariantDefString: asVariantDefString,
        asFormattedStringDefString: asFormattedStringDefString,
        asOptionalParameterDefString: asOptionalParameterDefString,
        asOptionalPropertyDefString: asOptionalPropertyDefString,
        asBoundedIntDefString: asBoundedIntDefString,
        asFunctionalDefString: asFunctionDefString,
        asStringEnum: asStringEnum,
    };
};
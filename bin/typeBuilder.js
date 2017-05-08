'use strict';

var signet = require('signet')();

var isUndefined = signet.isTypeOf('undefined');

var asMethod = signet.enforce('variant<string; array<string>> => string',
    function (input, output) {
        if (signet.isTypeOf('string')(input)) {
            return input + ' => ' + output;
        } else {
            return input.join(", ") + ' => ' + output;
        }
    });

var typedString = signet.enforce(asMethod('string', 'string'),
    function (name, typeString) {
        return name + '<' + typedString + '>';
    });

var asVariant = signet.enforce(asMethod('string', 'string'),
    function () {
        var args = Array.prototype.slice.call(arguments);
        if (!(signet.isTypeOf('array<string>'))) {
            throw new Error("all parrameters need to be of type'string'");
        }

        return 'variant<' + args.join('; ') + '>'
    });

var asBoundedInt = signet.enforce(asMethod('int, [int]', 'string'),
    function (min, max) {
        var realMax = isUndefined(max) ? Infinity : max;
        return 'boundedInt<' + min + ';' + realMax + '>';
    });

var asArray = signet.enforce(asMethod(asVariant('undefined', 'string'), 'string'),
    function (typeString) {
        const arrayName = 'array';
        if (isUndefined(typeString)) {
            return arrayName;
        }
        return arrayName + '<' + typeString + '>';
    });

var asFormattedString = signet.enforce(asMethod('string', 'string'),
    function (format) {
        return 'formattedString<' + format + '>';
    });

var asOptionalParameter = signet.enforce(asMethod('string', 'string'),
    function (typestring) {
        return '[' + typestring + ']';
    });

var asOptionalProperty = signet.enforce(asMethod('string', 'string'), asVariant.bind(null, 'undefined'));

var asStringEnum = signet.enforce(asMethod('string', 'string'), function () {
    var args = Array.prototype.slice.call(arguments);
    if (!(signet.isTypeOf('array<string>'))) {
        throw new Error("all parrameters need to be of type'string'");
    }

    return asFormattedString('^(' + args.join('|') + ')$');
});

var exportedType = {
    signet: signet,
    isUndefined: isUndefined,
    asArray: asArray,
    asVariant: asVariant,
    asFormattedString: asFormattedString,
    asOptionalParameter: asOptionalParameter,
    asOptionalProperty: asOptionalProperty,
    asBoundedInt: asBoundedInt,
    asMethod: asMethod,
    asStringEnum: asStringEnum,
};

module.exports = exportedType;
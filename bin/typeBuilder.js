'use strict';

var signet = require('signet')();

var isUndefined = signet.isTypeOf('undefined');

var asMethodDefString = signet.enforce('variant<string; array<string>> => string',
    function (input, output) {
        if (signet.isTypeOf('string')(input)) {
            return input + ' => ' + output;
        } else {
            return input.join(", ") + ' => ' + output;
        }
    });

var typedString = signet.enforce(asMethodDefString('string', 'string'),
    function (name, typeString) {
        return name + '<' + typedString + '>';
    });

var asVariantDefString = signet.enforce(asMethodDefString('string', 'string'),
    function () {
        var args = Array.prototype.slice.call(arguments);
        if (!(signet.isTypeOf('array<string>'))) {
            throw new Error("all parrameters need to be of type'string'");
        }

        return 'variant<' + args.join('; ') + '>'
    });

var asBoundedIntDefString = signet.enforce(asMethodDefString('int, [int]', 'string'),
    function (min, max) {
        var realMax = isUndefined(max) ? Infinity : max;
        return 'boundedInt<' + min + ';' + realMax + '>';
    });

var asArrayDefString = signet.enforce(asMethodDefString(asVariantDefString('undefined', 'string'), 'string'),
    function (typeString) {
        const arrayName = 'array';
        if (isUndefined(typeString)) {
            return arrayName;
        }
        return arrayName + '<' + typeString + '>';
    });

var asFormattedStringDefString = signet.enforce(asMethodDefString('string', 'string'),
    function (format) {
        return 'formattedString<' + format + '>';
    });

var asOptionalParameterDefString = signet.enforce(asMethodDefString('string', 'string'),
    function (typestring) {
        return '[' + typestring + ']';
    });

var asOptionalPropertyDefString = signet.enforce(asMethodDefString('string', 'string'), asVariantDefString.bind(null, 'undefined'));

var asStringEnumDefString = signet.enforce(asMethodDefString('string', 'string'), function () {
    var args = Array.prototype.slice.call(arguments);
    if (!(signet.isTypeOf('array<string>'))) {
        throw new Error("all parrameters need to be of type'string'");
    }

    return asFormattedStringDefString('^(' + args.join('|') + ')$');
});

var exportedType = {
    signet: signet,
    isUndefined: isUndefined,
    asArray: asArrayDefString,
    asVariant: asVariantDefString,
    asFormattedString: asFormattedStringDefString,
    asOptionalParameter: asOptionalParameterDefString,
    asOptionalProperty: asOptionalPropertyDefString,
    asBoundedInt: asBoundedIntDefString,
    asMethod: asMethodDefString,
    asStringEnum: asStringEnumDefString,
};

module.exports = exportedType;
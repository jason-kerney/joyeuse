'use strict';

var signet = require('signet')();

var isUndefined = signet.isTypeOf('undefined');

var asMethod = signet.enforce('string=>string',
    function (input, output) {
        return input + '=>' + output;
    });

var typedString = signet.enforce(asMethod('string', 'string'),
    function (name, typeString) {
        return name + '<' + typedString + '>';
    });

var asVariant = signet.enforce(asMethod('variant<string; array<string>>', 'string'),
    function () {
        var args = Array.prototype.slice.call(arguments);

        return 'variant<' + args.join('; ') + '>'
    });

var asBoundedInt = signet.enforce(asMethod('int, [int]', 'string'),
function(min, max){
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

var asOptional = signet.enforce(asMethod('string', 'string'),
    function (typestring) {
        return '[' + typestring + ']';
    });

var asOptionalProperty = signet.enforce(asMethod('string', 'string'), asVariant.bind(null, 'undefined'));

var exportedType = {
    signet: signet,
    isUndefined: isUndefined,
    asArray: asArray,
    asVariant: asVariant,
    asFormattedString: asFormattedString,
    asOptional: asOptional,
    asOptionalProperty: asOptionalProperty,
    asBoundedInt: asBoundedInt,
    asMethod: asMethod,
};

module.exports = exportedType;
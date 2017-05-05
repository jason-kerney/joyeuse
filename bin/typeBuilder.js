'use strict';

var signet = require('signet')();

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

var asArray = signet.enforce(asMethod(asVariant('undefined', 'string'), 'string'),
    function (typeString) {
        const arrayName = 'array';
        if (typeof typeString === 'undefined') {
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
    asArray: asArray,
    asVariant: asVariant,
    asFormattedString: asFormattedString,
    asOptional: asOptional,
    asOptionalProperty: asOptionalProperty,
};

module.exports = exportedType;
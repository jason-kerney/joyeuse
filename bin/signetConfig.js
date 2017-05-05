'use strict';

var signet = require('signet')();

function typedString(name, typeString){
    return name + '<' + typedString + '>';
}

function asArray(typeString)
{
    const arrayName = 'array';
    if(typeof typeString === 'undefined')
    {
        return arrayName;
    }
    return arrayName + '<' + typeString + '>';
}

function asVariant()
{
    var args = Array.prototype.slice.call(arguments);

    return 'variant<' + args.join('; ') + '>'
}

function asFormattedString(format)
{
    return 'formattedString<' + format + '>';
}

function asOptional(typestring) {
    return '[' + typestring + ']';
}

var exportedType = {
    signet: signet,
    asVariant: signet.enforce('variant<string; array<string>>=>string', asVariant),
    asFormattedString: signet.enforce('string=>string', asFormattedString),
    asArray: signet.enforce('variant<undefined; string>=>string', asArray),
    asOptional : signet.enforce('string=>string', asOptional)
};

module.exports = exportedType;
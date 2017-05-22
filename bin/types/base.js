'use strict';

const typeNames = require('./typeNames')();
const typeBuilder = require('../typeBuilder')();
const signet = typeBuilder.signet;
var fullPathRegex =
    '^(' +
    '(\\.{0,2})|' +
    '(\\w\\:)|' +
    '(\\w{2,}\\:\\/)|' +
    '([\\w\\d\\.\\_]+)' +
    ')?' +
    '(' +
    '\\/[\\w\\d\\.\\_]+' +
    ')+' +
    '\\/?$';

signet.alias(typeNames.path, typeBuilder.asFormattedStringDefString(fullPathRegex));

signet.subtype('string')(typeNames.requiredString, function (value) {
    return value.trim().length > 0;
});

// thanks: http://stackoverflow.com/questions/30735465/how-can-i-check-if-the-array-of-objects-have-duplicate-property-values
function hasDuplicates(values) {
    return (values.some(function (item, idx) {
        return values.indexOf(item) !== idx
    }));
}

signet.subtype(typeBuilder.asArrayDefString())(typeNames.distinctItemArray, function (values) {
    return !hasDuplicates(values);
});

function getBaseTypes() {
    return {
        isRequiredString: signet.isTypeOf(typeNames.requiredString),
        isPath: signet.isTypeOf(typeNames.path),
        isDistinctItemArray: signet.isTypeOf(typeNames.distinctItemArray),
        arrayHasDuplicates: hasDuplicates,
    };
}

module.exports = getBaseTypes;
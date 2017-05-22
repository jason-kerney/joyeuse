'use strict';

const typeNames = require('./typeNames')();
const typeBuilder = require('../typeBuilder')();
const signet = typeBuilder.signet;
var ip4Format = 'ip4Format';
var ip4Regex = '(localhost)|(([0-2]?\\d?\\d)\\.([0-2]?\\d?\\d)\\.(\\d?\\d?\\d)\\.([0-2]?\\d?\\d))';
var octet = 'octet';

signet.alias(ip4Format, typeBuilder.asFormattedStringDefString(ip4Regex));

signet.subtype('int')(octet, function (value) { return value >= 0 && value <= 255; })

signet.subtype(ip4Format)(typeNames.ip4.format, function (value) {
    if (value === 'localhost') {
        return true;
    }
    var octets = value.split(['.']).map(function (v) { return parseInt(v); });
    return signet.isTypeOf(typeBuilder.asArrayDefString(octet))(octets);
});

function getIp4() {
    return {
        isIp4String: signet.isTypeOf(typeNames.ip4.format),
        isOctet: signet.isTypeOf(octet)
    };
};

module.exports = getIp4;
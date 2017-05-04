'use strict';
var signetConfig = require('./signetConfig');
var signet = signetConfig.signet;

var ip4Regex = '[0-2]?[0-9]?[0-9]\.[0-2]?[0-9]?[0-9]\.[0-2]?[0-9]?[0-9]';
var ip4Format = 'ip4Format';
var ip4String = 'ip4String';
var octet = 'octet';

var requiredStringName = 'requiredString';

signet.subtype('string')(requiredStringName, function(value){
    return value.trim().length > 0;
});

signet.alias(ip4Format, 'formattedString<' + ip4Regex + '>');
signet.subtype('int')(octet, function (value) { return value >= 0 && value <= 255; })

signet.subtype(ip4Format)(ip4String, function (value) {
    var octets = value.split(['.']).map(function (v) { return parseInt(v); });
    return signet.isTypeOf('array<'+ octet +'>')(octets);
});

var knexConnection = {
    host : ip4String,
    user : 'your_database_user',
    password : 'your_database_password',
    database : 'myapp_test'
  };

module.exports = {
    ip4: {
        isIp4String: signet.isTypeOf(ip4String),
        isOctet: signet.isTypeOf(octet)
    },
    base: {
        isRequiredString: signet.isTypeOf(requiredStringName)
    }
};
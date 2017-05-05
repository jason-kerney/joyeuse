'use strict';
var signetConfig = require('./signetConfig');
var signet = signetConfig.signet;

var ip4Regex = '[0-2]?[0-9]?[0-9]\.[0-2]?[0-9]?[0-9]\.[0-2]?[0-9]?[0-9]';
var ip4Format = 'ip4Format';
var ip4String = 'ip4String';
var octet = 'octet';
var requiredString = 'requiredString';
var path = 'path'
var knexConnectionObject = 'knexConnectionObject';
var knexConnectionFileObject = 'knexConnectionFileObject';
var knexConnectionType = 'knexConnectionType';
var knexConstructorParam = 'knexConstructorParam'; 

signet.alias(path, 'formattedString<(\\.{0,2}|[a-zA-Z]\\:|[a-zA-Z]{2,}\\:\\/)?\\/[\\w\\.\\_]{1,}>');

signet.subtype('string')(requiredString, function(value){
    return value.trim().length > 0;
});

signet.alias(ip4Format, signetConfig.asFormattedString(ip4Regex));
signet.subtype('int')(octet, function (value) { return value >= 0 && value <= 255; })

signet.subtype(ip4Format)(ip4String, function (value) {
    var octets = value.split(['.']).map(function (v) { return parseInt(v); });
    return signet.isTypeOf(signetConfig.asArray(octet))(octets);
});

var knexConnection = {
    host : '[' + ip4String + ']',
    socketPath : '[' + requiredString + ']',
    user : requiredString,
    password : requiredString,
    database : requiredString,
  };

var knexConnectionFile = {
    filename: path
};


signet.defineDuckType(knexConnectionObject, knexConnection);
signet.defineDuckType(knexConnectionFileObject, knexConnectionFile);

signet.alias(knexConnectionType, signetConfig.asVariant(requiredString, knexConnectionFileObject, knexConnectionObject));


// var knexConstructor = {
//     client: requiredString,
//     connection: knexConnectionType,
//     searchPath: 
// };

module.exports = {
    ip4: {
        isIp4String: signet.isTypeOf(ip4String),
        isOctet: signet.isTypeOf(octet)
    },
    base: {
        isRequiredString: signet.isTypeOf(requiredString),
        isPath: signet.isTypeOf(path)
    },
    knex: {
        isSubConnectionInfo: signet.isTypeOf(knexConnectionObject),
        isSubConnectionInfoFilePath: signet.isTypeOf(knexConnectionFileObject),
        isConnectionInfo: signet.isTypeOf(knexConnectionType)
    }
};
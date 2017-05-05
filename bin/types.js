'use strict';
var typeBuilder = require('./typeBuilder');
var signet = typeBuilder.signet;

var pathSeperatorRegex = '\\/';
var pathStartRegex = '(\\.{0,2}|[a-zA-Z]\\:|[a-zA-Z]{2,}\\:' + pathSeperatorRegex + ')?';
var pathRegex = pathStartRegex + pathSeperatorRegex + '[a-zA-Z0-9_'+ pathSeperatorRegex +'\\.\\_]{1,}';

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

signet.alias(path, typeBuilder.asFormattedString(fullPathRegex));

signet.subtype('string')(requiredString, function (value) {
    return value.trim().length > 0;
});

signet.alias(ip4Format, typeBuilder.asFormattedString(ip4Regex));
signet.subtype('int')(octet, function (value) { return value >= 0 && value <= 255; })

signet.subtype(ip4Format)(ip4String, function (value) {
    var octets = value.split(['.']).map(function (v) { return parseInt(v); });
    return signet.isTypeOf(typeBuilder.asArray(octet))(octets);
});

var knexConnection = {
    host: typeBuilder.asOptionalProperty(ip4String),
    socketPath: typeBuilder.asOptionalProperty(path),
    user: requiredString,
    password: requiredString,
    database: requiredString,
};

var knexConnectionFile = {
    filename: path
};


signet.defineDuckType(knexConnectionObject + 'Part', knexConnection);

signet.subtype(knexConnectionObject + 'Part')(knexConnectionObject, function (conn) {
    var hasHost = signet.isTypeOf('undefined')(conn.host);
    var hasSocketPath = signet.isTypeOf('undefined')(conn.socketPath);

    return (hasHost !== hasSocketPath)
});

signet.defineDuckType(knexConnectionFileObject, knexConnectionFile);

signet.alias(knexConnectionType, typeBuilder.asVariant(requiredString, knexConnectionFileObject, knexConnectionObject));



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
        connectionParts: {
            isSubConnectionInfo: signet.isTypeOf(knexConnectionObject),
            isSubConnectionInfoFilePath: signet.isTypeOf(knexConnectionFileObject),
        },
        isConnectionInfo: signet.isTypeOf(knexConnectionType)
    }
};
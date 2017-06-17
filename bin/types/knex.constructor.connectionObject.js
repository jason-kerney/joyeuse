'use strict';
const signet = require('../../bin/types/loader.signet')();
const errorBuilder = require('../../bin/types/builder.error')();

signet.alias('octet', 'boundedInt<0, 255>');
signet.alias('ip4Format', 'formattedString<\\d+\\.\\d+\\.\\d+\\.\\d+>');

const isOctet = signet.isTypeOf('octet');
signet.subtype('ip4Format')('ip4', function (value){
    const octets = value.split('.').map(Number);
    return octets.every(isOctet);
});

signet.subtype('string')('nonempty_string', function (value){
    return value !== null && value.length > 0;
});

const connectionType = {
    host: 'ip4',
    user: 'nonempty_string',
    password: 'nonempty_string',
    database: 'nonempty_string'
};
signet.defineDuckType('knex.connection_object', connectionType);
const isConnectionType = signet.isTypeOf('knex.connection_object');

const isValid = function (value) {
    return isConnectionType(value);
}

const getError = function(value) {
    const errors = errorBuilder.toErrorMessages(signet.reportDuckTypeErrors('knex.connection_object')(value)).map((v) => '\t' + v);
    return [
        'connection object had an incorrect field',
        '{',
        errors.join('\n'),
        '}',
    ].join('\n')
}


module.exports = function () {
    return {
        isValid: isValid,
        getError: getError,
    };
}
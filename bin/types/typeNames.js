'use strict';

function getTypeNames() {
    return {
        ip4: {
            format: 'ip4String',
        },
        knex: {
            clients: 'knexClients',
            knexConstructorParam: 'knexConstructorParam',
        },
        joyeuse: {
            columnFlags: 'columnFlags',
            retlationsTypeDef: 'retlationsTypeDef',
        },
        requiredString: 'requiredString',
        path: 'path',
        distinctItemArray: 'distinctItemArray',
        validType: 'validType',
    };
}

module.exports = getTypeNames;
'use strict';

const typeBuilder = require('../typeBuilder')();
const typeNames = require('./typeNames')();
const getConnectionParts = require('./connectionParts');
const knexBaseTypes = require('./knexBase')();
const validator = require('../typesValidation')();

const connectionString = 'knexConnectionString';
const connectionObject = 'knexConnectionObject';
const connectionFileObject = 'knexConnectionFileObject';
const signet = typeBuilder.signet;


const connectionParts = getConnectionParts();

const connectionTypeDefs = typeBuilder.asVariantDefString(connectionObject, connectionFileObject, connectionString);
const knexConstructorTypeName = 'knexConstructorType';

function getKnexConstructorDef() {
    return {
        client: typeNames.knex.clients,
        searchPath: typeBuilder.asOptionalPropertyDefString(typeNames.requiredString),
        debug: typeBuilder.asOptionalPropertyDefString('boolean'),
        acquireConnectionTimeout: typeBuilder.asOptionalPropertyDefString(typeBuilder.asBoundedIntDefString(0)),
    };
}

const constructorType = getKnexConstructorDef();
constructorType.connection = connectionTypeDefs;
signet.defineDuckType(knexConstructorTypeName, constructorType);

function getKnexTypes() {
    function getConstructorParameterErrors(constructorParameter) {
        const constructorTypePartial = getKnexConstructorDef();
        if (signet.isTypeOf(knexConstructorTypeName)(constructorParameter)) {
            return [];
        }

        const constructorParameterName = 'constructorParameter';
        const connectionName = constructorParameterName + '.connection';

        const connectionErrors = connectionParts.getConnectionErrors(constructorParameterName + ".")(constructorParameter.connection);
        const connectionPoolErrors = knexBaseTypes.getConnectionPoolErrors(constructorParameterName + ".")(constructorParameter.pool);

        const errors = validator.getErrors(constructorParameterName, constructorTypePartial, constructorParameter);

        return errors.concat(connectionPoolErrors).concat(connectionErrors);
    }

    function getConstructorParameterErrorMessage(constuctorInfo) {
        const header = [
            'constuctor was not the correct type',
            '',
            'object recieved from constuctor:',
            JSON.stringify(constuctorInfo, null, 4),
            '',
            'Knex is the underlying library. To understand what it is expecting read:',
            'http://knexjs.org/',
            '',
            'Below is a list of properties and whether or not they pass validation.',
            '',
        ].join('\r\n');

        const errors = getConstructorParameterErrors(constuctorInfo);
        const isGood = errors.length === 0;

        function ErrorToString(error) {
            return error.property_name + ": " + String(error.value_given) + "\r\nExpected type: " + error.type;
        }

        return {
            valueString: isGood ? '' : '\r\n' + header + '\r\n' + errors.map(ErrorToString).join('\r\n') + '\r\n',
            errors: errors
        };
    }


    return {
        baseTypes: require('./knexBase')(),
        getKnexConnectionDef: getConnectionParts().getKnexConnectionDef,
        getKnexConstructorDef: getKnexConstructorDef,
        isKnexConstructor: signet.isTypeOf(knexConstructorTypeName),
        getConstuctorParameterErrors: getConstructorParameterErrors,
        getConstructorParameterErrorMessage: getConstructorParameterErrorMessage,
    };
}

module.exports = getKnexTypes;
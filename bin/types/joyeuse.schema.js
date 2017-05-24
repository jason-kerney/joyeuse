'use strict';

const typeBuilder = require('../typeBuilder')();
const typeNames = require('./typeNames')();
const validator = require('../typesValidation')();
const baseTypes = require('./base')();
const tables = require('./joyeuse.table')();
const signet = typeBuilder.signet;

function getSchemaDefinition() {
    return {
        schemaName: typeNames.requiredString
    };
}

function getErrors(schema) {
    const deffinition = getSchemaDefinition();
    const deffinitionKeys = Object.keys(deffinition);
    const baseErrors = validator.getErrors('schema', deffinition, schema);
    const possibleTables = Object.keys(schema).filter(function (key) {
        return !(deffinitionKeys.includes(key));
    }).map(function (key) {
        return schema[key];
    });

    const tableErrors = possibleTables.map(function (table) {
        return tables.getTableDefinitinTypeErrors(table)
    }).reduce(function (previous, current) {
        return previous.concat(current);
    }, []);

    const otherErrors = (
        possibleTables.length > 0
            ? []
            : [
                validator.constructTypeError('shema.tables', 'requires a table', undefined)
            ]
    );

    return baseErrors.concat(tableErrors).concat(otherErrors);
}

function validateSchema(schema) {
    return getErrors(schema).length === 0;
}

module.exports = function () {
    return {
        validateSchema: validateSchema,
        getErrors: getErrors,
    }
}
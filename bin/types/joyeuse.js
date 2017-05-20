'use strict';

const typeBuilder = require('../typeBuilder');
const typeNames = require('./typeNames')();
const validator = require('../typesValidation');
const baseTypes = require('./base')();
const signet = typeBuilder.signet;
const tableColumnExpression = '[\\w\\d]+\\.[\\w\\d]+';
const arrowExpression = '\\s\\*?\\->\\*?\\s';
const relationshipExpression = '^' + tableColumnExpression + arrowExpression + tableColumnExpression + '$';
const isRelationShip = new RegExp(relationshipExpression);

signet.subtype('string')(typeNames.joyeuse.retlationsTypeDef, function (value) {
    return isRelationShip.test(value);
});

const joyeuseTableDef = 'joyeuseTableDef';
const joyeuseColumnDef = 'joyeuseColumnDef';

function getColumnFlags() {
    return ['readonly', 'hidden'];
}

const columnFlags = getColumnFlags();
signet.extend(typeNames.validType, signet.isTypeOf('type'));

function getJoyeuseTypes() {

    function getTableDef() {
        return {
            tableName: typeNames.requiredString,
            dbQueryColumns: typeBuilder.asOptionalPropertyDefString('boolean'),
            key: typeBuilder.asArrayDefString(typeNames.requiredString),
        };
    }

    function getColumnTypeDef() {
        return {
            type: typeNames.validType,
            flags: typeNames.joyeuse.columnFlags,
        };
    }

    const tableType = getTableDef();
    const columnType = getColumnTypeDef();

    function getTableDefinitinTypeErrors(possibleTableDefinition) {
        const hasRelations = Boolean(possibleTableDefinition.relations);
        const relations = possibleTableDefinition.relations;
        const dbQueryColumns = Boolean(possibleTableDefinition.dbQueryColumns);
        const keyColumns = Boolean(possibleTableDefinition.key) ? possibleTableDefinition.key : [];
        const columns = (Object.keys(possibleTableDefinition).filter(function (key) {
            const value = possibleTableDefinition[key];
            return signet.isTypeOf(joyeuseColumnDef)(value)
                || (signet.isTypeOf('type')(value) && !signet.isTypeOf('function')(value));
        }));

        var baseErrors = validator.getErrors('joyeuseTableDefinition', tableType, possibleTableDefinition);

        if (!dbQueryColumns && columns.length === 0) {
            baseErrors.push(validator.constructTypeError('joyeuseTableDefinition.column', joyeuseColumnDef, undefined));
        }

        if (!dbQueryColumns && (keyColumns.length > 0)) {
            const keyErrors = keyColumns.filter(function (keyColumn) {
                return !columns.includes(keyColumn);
            }).map(function (keyColumn) {
                return validator.constructTypeError('joyeuseTableDefinition.column_key', joyeuseColumnDef, undefined);
            });

            baseErrors = baseErrors.concat(keyErrors);
        }

        function isNamedColumn(name) {
            return columns.includes(name);
        }

        function getRelationColumnName(relation) {
            const finds = /^([\w\d]+)\.([\w\d]+)/.exec(relation);
            if (!Boolean(finds)) {
                throw new Error('not a valid relation column')
            }
            return [relation, finds[2]];
        }

        function getRelationColumnNames() {
            return relations.map(getRelationColumnName);
        }

        function columnsExist() {
            const exists =
                getRelationColumnNames()
                    .map(function (values) {
                        return values[1]
                    })
                    .map(isNamedColumn)
                    .reduce(function (acc, hasName) {
                        return acc && hasName;
                    }, true);

            return columns.length > 0 && exists;
        }

        const isRelationshipArray = signet.isTypeOf(typeBuilder.asArrayDefString(typeNames.joyeuse.retlationsTypeDef))(relations);
        const hasGoodRelations = !hasRelations || (isRelationshipArray && dbQueryColumns) || (isRelationshipArray && columnsExist());
        if (!hasGoodRelations) {
            const isStringArray = signet.isTypeOf(typeBuilder.asArrayDefString('string'))(relations);
            if (hasRelations && !isRelationshipArray) {
                baseErrors.push(validator.constructTypeError('joyeuseTableDefinition.relations', typeBuilder.asArrayDefString(typeNames.joyeuse.retlationsTypeDef), relations));
            }

            if (hasRelations && isRelationshipArray && !columnsExist() && !dbQueryColumns) {
                const names = getRelationColumnNames();
                const bads = names.filter(function (values) {
                    return !isNamedColumn(values[1]);
                }).map(function (name) {
                    const relation = name[0];
                    const index = relations.indexOf(relation);

                    return validator.constructTypeError('joyeuseTableDefinition.relations[' + index + ']', 'Must start with a reference to a valid column on base table.', relation);
                });

                baseErrors = baseErrors.concat(bads);
            }
        }

        const knownFields = Object.keys(tableType);
        const possibleKeys = Object.keys(possibleTableDefinition);
        const unknownFields = possibleKeys.filter(function (key) {
            const isBadField = !(
                isNamedColumn(key)
                || knownFields.includes(key)
                || key === 'relations'
            );

            return isBadField;
        }).map(function (key) {
            const value = possibleTableDefinition[key];
            const actualValue = signet.isTypeOf('function')(value) ? value.toString() : value;
            return validator.constructTypeError('joyeuseTableDefinition.' + key, 'unknown member', actualValue);
        });

        return baseErrors.concat(unknownFields);
    }

    function isTableDefinition(possibleTableDefiniton) {
        return getTableDefinitinTypeErrors(possibleTableDefiniton).length === 0;
    }

    function isColumnFlag(item) {
        return columnFlags.includes(item);
    }

    function getColumnDefinitionBuilder() {
        return signet.enforce(typeBuilder.asFunctionalDefString(typeNames.validType, joyeuseColumnDef), function type(validTypeName) {
            var columnDefinition = {
                type: validTypeName,
                flags: []
            };

            function contains(flags) {
                return function (flagToFind) {
                    return flags.filter(function (flag) {
                        return flag === flagToFind;
                    }).length > 0;
                };
            }

            function containsHidden(flags) {
                return contains(columnDefinition.flags)('hidden');
            }

            function containsReadonly(flags) {
                return contains(columnDefinition.flags)('readonly');
            }

            function hidden() {
                if (containsHidden(columnDefinition.flags)) {
                    return columnDefinition;
                }
                columnDefinition.flags.push('hidden');

                return columnDefinition;
            }

            function readonly() {
                if (contains(columnDefinition.flags)('readonly')) {
                    return columnDefinition;
                }

                columnDefinition.flags.push('readonly');
                return columnDefinition;
            }

            function init(fn) {
                if (!typeBuilder.isUndefined(columnDefinition.initFn)) {
                    return columnDefinition;
                }

                var functionSignature = typeBuilder.asFunctionalDefString('()', validTypeName);

                columnDefinition.initFn = function () {
                    var result = fn();
                    if (!signet.isTypeOf(validTypeName)(result)) {
                        throw new Error("Expected to return type of " + validTypeName);
                    }

                    return result;
                };
                return columnDefinition;
            }

            columnDefinition.hidden = hidden;
            columnDefinition.readonly = readonly;
            columnDefinition.init = init;

            return columnDefinition;
        });
    }

    function getColumnDefinitionTypeErrors(columnInfo) {
        if (signet.isTypeOf(joyeuseColumnDef)(columnInfo)) {
            return [];
        }

        var deffErrors = validator.getErrors('joyeuseColumnDefinition', joyeuseColumnDef, columnInfo);
        (Object.keys(columnType)).forEach(function (element) {
            deffErrors = deffErrors.concat(validator.getErrors(element, columnType[element], columnInfo[element]))
        }, this);

        return deffErrors;
    }

    signet.alias('arrayString', typeBuilder.asArrayDefString('string'));
    signet.subtype('arrayString')(typeNames.joyeuse.columnFlags,
        function (flags) {
            var allItemsAreValid = flags.filter(isColumnFlag).length === flags.length;

            return (
                (flags.length > 0)
                && (allItemsAreValid)
                && (!baseTypes.arrayHasDuplicates(flags))
            ) || flags.length === 0;
        });

    signet.defineDuckType(joyeuseColumnDef, columnType);
    signet.extend(joyeuseTableDef, function (value) {
        return isTableDefinition(value);
    });

    const tableValidationErrorOptions = {
        inputErrorBuilder: function (_, arg, __) {
            const errors = getTableDefinitinTypeErrors(arg[0]);
            return "Expected a valid table definition. The errors are: \n" + JSON.stringify(errors, null, 4);
        }
    };

    var table = signet.enforce(joyeuseTableDef, function table(tableDefinition) {
        return tableDefinition;
    }, tableValidationErrorOptions);

    return {
        columnDefinitionType: getColumnTypeDef(),
        columnFlags: getColumnFlags(),
        getColumnDefinitionTypeErrors: getColumnDefinitionTypeErrors,
        isColumnFlag: signet.isTypeOf(typeNames.joyeuse.columnFlags),
        isJoyeuseColumnDefinition: signet.isTypeOf(joyeuseColumnDef),
        getColumnDefinitionBuilder: getColumnDefinitionBuilder,
        getTableDefinitinTypeErrors: getTableDefinitinTypeErrors,
        isTableDefinition: isTableDefinition,
        table: table,
    };
}

module.exports = getJoyeuseTypes;
'use strict';

const approvalsConfig = require('./test-utils/approvalsConfig');
const approvals = require('approvals').configure(approvalsConfig).mocha('./tests/approvals');
const pretyJson = require('./test-utils/pretyJson');
const assert = require('chai').assert;
const typeBuilder = require('../bin/typeBuilder')();
const signet = typeBuilder.signet;


function ipGenerator(max) {
    var values = [];

    function part() {
        return Math.floor(Math.random() * max);
    }

    for (var i = 0; i <= 1000; i++) {
        var part1 = part();
        var part2 = part();
        var part3 = part();
        var part4 = part();
        var isValid =
            part1 <= 255
            && part2 <= 255
            && part3 <= 255
            && part4 <= 255;

        values.push({
            ip: part1 + '.' + part2 + '.' + part3 + '.' + part4,
            isValid: isValid
        });
    }

    return values;
}

describe('type definitions', function () {

    const typesFactory = require('../bin/types');
    const types = typesFactory();
    const typeNames = types.typeNames;
    const ip4Types = types.ip4;


    it('should correctly validate ip4 strings', function () {
        var ips = ipGenerator(255 * 2);

        ips.forEach(function (element) {
            var check = ip4Types.isIp4String(element.ip);
            var message = check ? element.ip + " is recorded as valid" : element.ip + " is recorded as invalid";

            assert.equal(element.isValid, check, message);
        }, this);
    });

    it('should validate required strings', function () {
        var validString = "a";
        var spaceOnly = " ";
        var tabOnly = "\t";
        var undifinedString = undefined;
        var nullString = null;
        var emptyString = '';

        assert.isTrue(types.base.isRequiredString(validString), "a valid string should be valid");
        assert.isFalse(types.base.isRequiredString(spaceOnly), "a space is not a valid string");
        assert.isFalse(types.base.isRequiredString(tabOnly), "a tab is not a valid string");
        assert.isFalse(types.base.isRequiredString(undifinedString), "undifined is not a valid string");
        assert.isFalse(types.base.isRequiredString(nullString), "null is not a valid string");
        assert.isFalse(types.base.isRequiredString(emptyString), "an empty string is not a valid string");
    });

    it('should validate knex example file path as a file path', function () {
        assert.isTrue(types.base.isPath("./mydb.sqlite"));
    });

    it('should validate a unique array', function () {
        assert.isTrue(types.base.isDistinctItemArray([]), 'empty array');
        assert.isTrue(types.base.isDistinctItemArray(['hello', 'bob', 3, 2]), 'mixed array');
        assert.isFalse(types.base.isDistinctItemArray([1, 2, 1]), 'number array with duplicates');
        assert.isFalse(types.base.isDistinctItemArray(['world', 'hello', 'world']), 'string array with duplicates');
    });

    describe('knex connection object', function () {
        it('should have a definition for what each connection type is', function () {
            this.verify(pretyJson(types.knex.getKnexConnectionDef()));
        });

        it('should validate an exceptable sql client', function () {
            var isClient = types.knex.baseTypes.isClient;
            assert.isTrue(isClient('postgres'), 'Postgres');
            assert.isTrue(isClient('mssql'), 'MSSQL');
            assert.isTrue(isClient('mariadb'), 'MariaDB');
            assert.isTrue(isClient('sqlite3'), 'SQLite3');
            assert.isTrue(isClient('oracle'), 'Oracle');

            assert.isFalse(isClient('access'), 'Access');
        });

        it('should contain a definition for connection pool', function () {
            this.verify(pretyJson(types.knex.baseTypes.getConnectionPoolDef()));
        });
    });

    describe('knex constructor parameter', function () {
        const isKnexConstructor = types.knex.isKnexConstructor;
        const getConstructorParameterErrorMessage = types.knex.getConstructorParameterErrorMessage;

        it('should contain a type definition for the construction parameter', function () {
            this.verify(pretyJson(types.knex.getKnexConstructorDef()));
        });

        it('should show that database name was missing', function () {
            var props = {
                client: 'mysql',
                connection: {
                    user: 'root',
                }
            };
            this.verify(pretyJson(types.knex.getConstuctorParameterErrors(props)))
        });

        it('should validate a correct object with connection string, debug, connection pool and acquireConnectionTimeout', function () {
            var param = {
                client: 'mysql',
                connection: "some connection string",
                searchPath: "some,path",
                debug: false,
                pool: { min: 0, max: 1000 },
                acquireConnectionTimeout: 100,
            };

            assert.isTrue(isKnexConstructor(param), getConstructorParameterErrorMessage(param).valueString);
        });

        it('should validate a correct object wit connection string and without debug, connection pool and acquireConnectionTimeout', function () {
            var param = {
                client: 'mysql',
                connection: "some connection string",
                searchPath: "some,path",
            };

            assert.isTrue(isKnexConstructor(param), getConstructorParameterErrorMessage(param).valueString);
        });

        it('should require a correct client', function () {
            var param = {
                client: 'access',
                connection: "some connection string",
                searchPath: "some,path",
            };

            assert.isFalse(isKnexConstructor(param), getConstructorParameterErrorMessage(param).valueString);
        });

        it('should be able to tell you the client is incorrect', function () {
            var param = {
                client: 'access',
                connection: "some connection string",
                searchPath: "some,path",
            };

            this.verify(getConstructorParameterErrorMessage(param).valueString);
        });

        it('should require a connection', function () {
            var param = {
                client: 'mssql',
                searchPath: "some,path",
            };

            assert.isFalse(isKnexConstructor(param), getConstructorParameterErrorMessage(param).valueString);
        });

        it('should report that connection is missing', function () {
            var param = {
                client: 'mssql',
                searchPath: "some,path",
            };

            this.verify(getConstructorParameterErrorMessage(param).valueString);
        });

        it('should require a correct connection string', function () {
            var param = {
                client: 'mssql',
                connection: "",
                searchPath: "some,path",
            };

            assert.isFalse(isKnexConstructor(param), getConstructorParameterErrorMessage(param).valueString);
        });

        it('should report connection string is incorrect', function () {
            var param = {
                client: 'mssql',
                connection: "",
                searchPath: "some,path",
            };

            this.verify(getConstructorParameterErrorMessage(param).valueString);
        });

        it('should not require a search path', function () {
            var param = {
                client: 'oracle',
                connection: "some connection string",
                database: "some database"
            };

            assert.isTrue(isKnexConstructor(param), JSON.stringify(getConstructorParameterErrorMessage(param), null, 4));
        });
    });

    describe('for joyeuse types', function () {
        const joy = types.joyeuse.tables;

        it('should have all column flags', function () {
            this.verify(JSON.stringify(joy.columnFlags, null, 4));
        });

        it('should validate [\'readonly\'] as valid columnFlags', function () {
            assert.isTrue(joy.isColumnFlag(['readonly']));
        });

        it('should validate [\'readonly\', \'readonly\'] as not valid columnFlags', function () {
            assert.isFalse(joy.isColumnFlag(['readonly', 'readonly']));
        });

        it('should validate all flags as being valid as a columnFlags', function () {
            assert.isTrue(joy.isColumnFlag(joy.columnFlags));
        })

        it('should correctly validate relationships', function () {
            const testCases = [
                ['oneToOne', 'Customer.Id -> WishList.CustomerId'],
                ['oneToMany', 'Customer.Id ->* Orders.CustomerId'],
                ['manyToOne', 'ZipCode.Id *-> Address.ZipCodeId'],
                ['manyToMany', 'Orders.Tag *->* Product.Tag']
            ];

            testCases.forEach(function (testCase) {
                assert.isTrue(signet.isTypeOf(typeNames.joyeuse.retlationsTypeDef)(testCase[1]), testCase[0] + ' "' + testCase[1] + '"');
            }, this);
        });

        describe('column definition', function () {
            const joy = types.joyeuse.tables;
            it('should contain a definition type', function () {
                this.verify(pretyJson(joy.columnDefinitionType));
            });

            it('should validate a good deffinition', function () {
                var columnDefinition = {
                    name: "ProductName",
                    type: 'int',
                    flags: ["readonly"],
                };

                assert.isTrue(joy.isJoyeuseColumnDefinition(columnDefinition));
            });

            it('should be able to give good errors', function () {
                var columnDefinition = {
                    type: 'numberThingy',
                    flags: ["helpful"],
                };

                this.verify(pretyJson(joy.getColumnDefinitionTypeErrors(columnDefinition)));
            });

            it('should be have a definition builder that takes a type name', function () {
                var columnBuilder = joy.getColumnDefinitionBuilder();
                var columnDef = columnBuilder('int');
                this.verify(pretyJson(columnDef));
            });

            it('should be have a definition builder that takes a type name - boolean', function () {
                var columnBuilder = joy.getColumnDefinitionBuilder();
                var columnDef = columnBuilder('boolean');
                this.verify(pretyJson(columnDef));
            });

            it('should be have a definition builder that can be made readonly', function () {
                var columnBuilder = joy.getColumnDefinitionBuilder();
                var columnDef = columnBuilder('int').readonly();
                this.verify(pretyJson(columnDef));
            });

            it('should be have a column builder that can be made hidden', function () {
                var columnBuilder = joy.getColumnDefinitionBuilder();
                var columnDef = columnBuilder('boolean').hidden();
                this.verify(pretyJson(columnDef));
            });

            it('should be have a definition builder that can be made hidden then readonly', function () {
                var columnBuilder = joy.getColumnDefinitionBuilder();
                var columnDef = columnBuilder('boolean').hidden().readonly();
                this.verify(pretyJson(columnDef));
            });

            it('should be have a definition builder that can be made readonly then hidden', function () {
                var columnBuilder = joy.getColumnDefinitionBuilder();
                var columnDef = columnBuilder('boolean').readonly().hidden();
                this.verify(pretyJson(columnDef));
            });

            it('should be have a  definition builder that can be made readonly then readonly', function () {
                var columnBuilder = joy.getColumnDefinitionBuilder();
                var columnDef = columnBuilder('boolean').readonly().readonly();
                this.verify(pretyJson(columnDef));
            });

            it('should be have a definition builder that can be made hidden then hidden', function () {
                var columnBuilder = joy.getColumnDefinitionBuilder();
                var columnDef = columnBuilder('boolean').hidden().hidden();
                this.verify(pretyJson(columnDef));
            });

            it('should be have a definition builder that can be made hidden then hidden', function () {
                var columnBuilder = joy.getColumnDefinitionBuilder();
                var columnDef = columnBuilder('boolean').hidden().hidden();
                this.verify(pretyJson(columnDef));
            });

            it('should have a definition builder that init a type', function () {
                var columnBuilder = joy.getColumnDefinitionBuilder();

                var columnDef = columnBuilder('int');
                assert.isUndefined(columnBuilder.initFn);
                columnDef = columnDef.init(function () {
                    return 2;
                });

                var result = columnDef.initFn();
                assert.equal(2, result);
            });

            it('should have a definition builder that init a type - boolean', function () {
                var columnBuilder = joy.getColumnDefinitionBuilder();

                var columnDef = columnBuilder('boolean');
                assert.isUndefined(columnBuilder.initFn);
                columnDef = columnDef.init(function () {
                    return true;
                });

                var result = columnDef.initFn();
                assert.equal(true, result);
            });

            it('should have a definition that throws an error when it returns wrong type.', function () {
                var columnBuilder = joy.getColumnDefinitionBuilder();

                var columnDef = columnBuilder('int');
                assert.isUndefined(columnBuilder.initFn);
                columnDef = columnDef.init(function () {
                    return "some thing";
                });

                var throwing = columnDef.initFn.bind(null);
                assert.throws(throwing, "Expected to return type of int");
            });

            it('should have a definition that throws an error when it returns wrong type. - boolean', function () {
                var columnBuilder = joy.getColumnDefinitionBuilder();

                var columnDef = columnBuilder('boolean');
                assert.isUndefined(columnBuilder.initFn);
                columnDef = columnDef.init(function () {
                    return 4;
                });

                var throwing = columnDef.initFn.bind(null);
                assert.throws(throwing, "Expected to return type of boolean");
            });
        });

        describe('table definiton', function () {
            const joy = types.joyeuse.tables;
            var type;

            beforeEach(function () {
                type = joy.getColumnDefinitionBuilder();
            });

            it('should validate a good table definintion with 1 key, 1 column no dbQuery, and 2 defined relations', function () {
                const table = {
                    tableName: 'device',
                    dbQueryColumns: false,
                    key: ['id'],
                    id: type('int'),
                    relations: [
                        `MyDevice.id *-> MyUser.deviceId`,
                        `MyDevice.id *-> Records.deviceId`
                    ]
                };

                assert.isTrue(joy.isTableDefinition(table), joy.getTableDefinitinTypeErrors(table));
            });

            it('should validate a good definintion with 1 key, 1 column no dbQuery and no defined relations', function () {
                const table = {
                    tableName: 'device',
                    dbQueryColumns: false,
                    key: ['id'],
                    id: type('int')
                };

                assert.isTrue(joy.isTableDefinition(table), joy.getTableDefinitinTypeErrors(table));
            });

            it('should validate a good definintion with 1 key, 1 column no dbQuery and no defined relations', function () {
                const table = {
                    tableName: 'device',
                    dbQueryColumns: false,
                    key: ['id'],
                    id: type('int')
                };

                assert.isTrue(joy.isTableDefinition(table), joy.getTableDefinitinTypeErrors(table));
            });

            it('should validate a good definintion with no key, 1 column as a type string no dbQuery and no defined relations', function () {
                const table = {
                    tableName: 'emails',
                    dbQueryColumns: false,
                    key: [],
                    id: 'string'
                };

                assert.isTrue(joy.isTableDefinition(table), pretyJson(joy.getTableDefinitinTypeErrors(table)));
            });

            it('should show errors for a definintion without a key defined', function () {
                const table = {
                    tableName: 'device',
                    dbQueryColumns: false,
                    id: type('int')
                };

                assert.isFalse(joy.isTableDefinition(table), pretyJson(joy.getTableDefinitinTypeErrors(table)));
                this.verify(pretyJson(joy.getTableDefinitinTypeErrors(table)));
            });

            it('should show errors for a definintion without any columns and no dbQuery', function () {
                const table = {
                    tableName: 'device',
                    dbQueryColumns: false,
                    key: []
                };

                assert.isFalse(joy.isTableDefinition(table), pretyJson(joy.getTableDefinitinTypeErrors(table)));
                this.verify(pretyJson(joy.getTableDefinitinTypeErrors(table)));
            });

            it('should validate for a definintion without any columns and dbQuery', function () {
                const table = {
                    tableName: 'device',
                    dbQueryColumns: true,
                    key: []
                };

                assert.isTrue(joy.isTableDefinition(table), pretyJson(joy.getTableDefinitinTypeErrors(table)));
            });

            it('should show errors for a definintion a key that is not a column and no dbQuery', function () {
                const table = {
                    tableName: 'device',
                    dbQueryColumns: false,
                    key: ['id'],
                    name: type('string')
                };

                assert.isFalse(joy.isTableDefinition(table), pretyJson(joy.getTableDefinitinTypeErrors(table)));
                this.verify(pretyJson(joy.getTableDefinitinTypeErrors(table)));
            });

            it('should return the table if table is called with a valid table', function () {
                const table = {
                    tableName: 'device',
                    dbQueryColumns: false,
                    key: ['id'],
                    id: type('int')
                };

                this.verify(pretyJson(joy.table(table)));
            });

            it('should fail a definintion with 1 key, 1 column no dbQuery, 1 incorrectly defined relation', function () {
                const table = {
                    tableName: 'device',
                    dbQueryColumns: false,
                    key: ['id'],
                    id: type('int'),
                    relations: [
                        `MyDevice *-> MyUser.deviceId`,
                        `MyDevice.id *-> Records.deviceId`
                    ]
                };

                var errors = pretyJson(joy.getTableDefinitinTypeErrors(table));
                assert.isFalse(joy.isTableDefinition(table), errors);
                this.verify(errors);
            });

            it('should fail a definintion with 1 key, 1 column no dbQuery, and 2 defined relations but one relation does not contain a valid column.', function () {
                const table = {
                    tableName: 'device',
                    dbQueryColumns: false,
                    key: ['id'],
                    id: type('int'),
                    relations: [
                        `MyDevice.nameId *-> Names.Id`,
                        `MyDevice.id *-> Records.deviceId`
                    ]
                };

                var errors = pretyJson(joy.getTableDefinitinTypeErrors(table));
                assert.isFalse(joy.isTableDefinition(table), errors);
                this.verify(errors);
            });

            it('should thow a nice error when table is called and given a definintion without a key defined', function () {
                const table = {
                    tableName: 'device',
                    dbQueryColumns: false,
                    id: type('int')
                };

                var err;
                try {
                    joy.table(table);
                    //assert.throws(badCall, 'Expected a valid table definition. The errors are: \n[\n    {\n        "property_name": "joyeuseTableDefinition.tableName",\n        "type": "requiredString",\n        "value_given": "undefined"\n    },\n    {\n        "property_name": "joyeuseTableDefinition.key",\n        "type": "array<requiredString>",\n        "value_given": "undefined"\n    },\n    {\n        "property_name": "joyeuseTableDefinition.column",\n        "type": "joyeuseColumnDef",\n        "value_given": "undefined"\n    }\n]');
                } catch (error) {
                    err = error.message;
                }

                this.verify(pretyJson(err));
            });

            it('should not validate a good definintion if it has extra properties', function () {
                const table = {
                    tableName: 'device',
                    dbQueryColumns: false,
                    key: ['id'],
                    id: 'int',
                    relations: [
                        `MyDevice.id *-> MyUser.deviceId`
                    ],
                    comment_For_Developer: 'This is not a valid member of a table',
                    transformer: function (value) {
                        return String(value).length;
                    }
                };

                var errors = pretyJson(joy.getTableDefinitinTypeErrors(table));
                assert.isFalse(joy.isTableDefinition(table), errors);
                this.verify(errors);
            });
        });
    });

    //proof of concept
    describe('connect to real db', function () {
        it.skip('should connect to a real db', function (done) {

            var props = {
                client: 'mysql',
                connection: {
                    host: 'localhost',
                    user: 'root',
                    database: 'playground'
                }
            };

            var joy = require('../bin/joyeuse');
            var factory = joy.getFactory(props);
            var knex = factory.knex;

            var people = knex('people').select();

            console.log(Object.keys(people));

            people.then(function (person) {
                console.log('here');
                console.log(JSON.stringify(person[0], null, 4));
                done();
            }).catch(function () {
                console.log('error');
                done();
            });
        });
    }); // end proof of concept
});

describe('signet', function () {
    var signetFactory = require('signet');
    var signet;

    beforeEach(function () {
        signet = signetFactory();
    });

    it('should recognize a bogus type', function () {
        assert.isFalse(signet.isType('foo'));
    });
});

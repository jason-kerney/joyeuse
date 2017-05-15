'use strict';

var approvalsConfig = require('./test-utils/approvalsConfig');
var approvals = require('approvals').configure(approvalsConfig).mocha('./tests/approvals');
var pretyJson = require('./test-utils/pretyJson');
var assert = require('chai').assert;

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

    var types = require('../bin/types');
    var ip4Types = types.ip4;

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
        var isKnexConstructor = types.knex.isKnexConstructor;
        var getConstructorParameterErrorMessage = types.knex.getConstructorParameterErrorMessage;

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

    describe('for joueuse types', function () {
        it('should have all column flags', function () {
            this.verify(JSON.stringify(types.joyeuse.dbFlags, null, 4));
        });

        it('should validate [\'readonly\'] as valid dbFlags', function () {
            assert.isTrue(types.joyeuse.isDbFlag(['readonly']));
        });

        it('should validate [\'readonly\', \'readonly\'] as not valid dbFlags', function () {
            assert.isFalse(types.joyeuse.isDbFlag(['readonly', 'readonly']));
        });

        it('should validate all flags as being valid as a dbFlags', function () {
            assert.isTrue(types.joyeuse.isDbFlag(types.joyeuse.dbFlags));
        })

        it('should contain a column definition type', function () {
            this.verify(pretyJson(types.joyeuse.columnDefinitionType));
        });

        it('should validate a good column deffinition', function () {
            var columnDefinition = {
                name: "ProductName",
                type: 'int',
                flags: ["readonly"],
            };

            assert.isTrue(types.joyeuse.isJoyeuseColumnDefinition(columnDefinition));
        });

        it('should be able to give good errors for a column deffinition', function () {
            var columnDefinition = {
                type: 'numberThingy',
                flags: ["helpful"],
            };

            this.verify(pretyJson(types.joyeuse.getColumnTypeErrors(columnDefinition)));
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

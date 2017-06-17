'use strict';

const pretyJson = require('./test-utils/pretyJson');
const assert = require('chai').assert;
// const typeBuilder = require('../bin/typeBuilder')();
// const signet = typeBuilder.signet;


function ipGenerator(max) {
    var values = [];

    function part() {
        return Math.floor(Math.random() * max);
    }

    for (var i = 0; i <= 1000; i++) {
        const part1 = part();
        const part2 = part();
        const part3 = part();
        const part4 = part();
        const isValid =
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
    require('./test-utils/approvalsConfig');

    const typesFactory = require('../bin/types');
    const types = typesFactory();
    const typeNames = types.typeNames;
    const ip4Types = types.ip4;

    it('should correctly validate ip4 strings', function () {
        const ips = ipGenerator(255 * 2);

        ips.forEach(function (element) {
            const check = ip4Types.isIp4String(element.ip);
            const message = check ? element.ip + " is recorded as valid" : element.ip + " is recorded as invalid";

            assert.equal(element.isValid, check, message);
        }, this);
    });

    it('should validate required strings', function () {
        const validString = "a";
        const spaceOnly = " ";
        const tabOnly = "\t";
        const undifinedString = undefined;
        const nullString = null;
        const emptyString = '';

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
            const isClient = types.knex.baseTypes.isClient;
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
            const props = {
                client: 'mysql',
                connection: {
                    user: 'root',
                }
            };
            this.verify(pretyJson(types.knex.getConstuctorParameterErrors(props)))
        });

        it('should validate a correct object with connection string, debug, connection pool and acquireConnectionTimeout', function () {
            const param = {
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
            const param = {
                client: 'mysql',
                connection: "some connection string",
                searchPath: "some,path",
            };

            assert.isTrue(isKnexConstructor(param), getConstructorParameterErrorMessage(param).valueString);
        });

        it('should require a correct client', function () {
            const param = {
                client: 'access',
                connection: "some connection string",
                searchPath: "some,path",
            };

            assert.isFalse(isKnexConstructor(param), getConstructorParameterErrorMessage(param).valueString);
        });

        it('should be able to tell you the client is incorrect', function () {
            const param = {
                client: 'access',
                connection: "some connection string",
                searchPath: "some,path",
            };

            this.verify(getConstructorParameterErrorMessage(param).valueString);
        });

        it('should require a connection', function () {
            const param = {
                client: 'mssql',
                searchPath: "some,path",
            };

            assert.isFalse(isKnexConstructor(param), getConstructorParameterErrorMessage(param).valueString);
        });

        it('should report that connection is missing', function () {
            const param = {
                client: 'mssql',
                searchPath: "some,path",
            };

            this.verify(getConstructorParameterErrorMessage(param).valueString);
        });

        it('should require a correct connection string', function () {
            const param = {
                client: 'mssql',
                connection: "",
                searchPath: "some,path",
            };

            assert.isFalse(isKnexConstructor(param), getConstructorParameterErrorMessage(param).valueString);
        });

        it('should report connection string is incorrect', function () {
            const param = {
                client: 'mssql',
                connection: "",
                searchPath: "some,path",
            };

            this.verify(getConstructorParameterErrorMessage(param).valueString);
        });

        it('should not require a search path', function () {
            const param = {
                client: 'oracle',
                connection: "some connection string",
                database: "some database"
            };

            assert.isTrue(isKnexConstructor(param), JSON.stringify(getConstructorParameterErrorMessage(param), null, 4));
        });
    });

    //proof of concept
    describe('connect to real db', function () {
        require('./test-utils/approvalsConfig');

        it.skip('should connect to a real db', function (done) {

            const props = {
                client: 'mysql',
                connection: {
                    host: 'localhost',
                    user: 'root',
                    database: 'playground'
                }
            };

            const joy = require('../bin/joyeuse');
            const factory = joy.getFactory(props);
            const knex = factory.knex;

            const people = knex('people').select();

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

if (typeof global.runQuokkaMochaBdd === 'function') {
    runQuokkaMochaBdd();
}
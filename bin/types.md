# types.js #

## Joyeuse Types ##

This file holds all the types that are the building blocks of Joyeuse.

example:
```javascript
    var typeNames = require('joyeuse').types;
```

Types members are:

[typeNames](#typeNames)</br>
[base](#base)</br>
[ip4](#ip4)</br>
[knex](#knex)</br>
[joyeuse](#joyeuse)</br>

### typeNames ###

These are all the exposed type names. They are:

[typeNames.validType](#typeNames.validType)</br>
[typeNames.requiredString](#typeNames.requiredString)</br>
[typeNames.path](#typeNames.path)</br>
[typeNames.distinctItemArray](#typeNames.distinctItemArray)</br>
[typeNames.ip4.format](#typeNames.ip4.format)</br>
[typeNames.knex.clients](#typeNames.knex.clients)</br>
[typeNames.knex.knexConstructorParam](#typeNames.knex.knexConstructorParam)</br>
[typeNames.joyeuse.columnFlags](#typeNames.joyeuse.columnFlags)

#### typeNames.validType ###
This is the name of a type that represents a string containing a name of a registerd [signet](https://www.npmjs.com/package/signet) type.

#### typeNames.requiredString ####
This is the name of the type that requires a non-zero length string.

#### typeNames.path ####
This is the name of the type that requires a string representing a valid path.

#### typeNames.distinctItemArray ####
This is the name of the type that represents an array of non-duplicate items.

#### typeNames.ip4.format ####
This is the name of the type represeting a string formatted as an IP4 address.

#### typeNames.knex.clients ####
This is the name of the type for a string field that is resticted to the list of [Knex](http://knexjs.org/) supported clients.

#### typeNames.knex.knexConstructorParam ####
This is the name of the type that is used to construct [Knex](http://knexjs.org/) and also used to construct the [Joyeuse Factory](joyeuse.md#getFactory).

#### typeNames.joyeuse.columnFlags ####
This is the name of the type that represents the unique array of valid column flags.

### base ###
This contains methods used to validate base types give directly off of [typeNames](#typeNames).

Functions Provided:

[base.isRequiredString](#base.isRequiredString)</br>
[base.isPath](#base.isPath)</br>
[base.isDistinctItemArray](#base.isDistinctItemArray)</br>
[base.arrayHasDuplicates](#base.arrayHasDuplicates)</br>

#### base.isRequiredString ###
This function determines if a given string is a [required string](#typeNames.requiredString). Meaning it is a non-zero length string containing more then white space. This returns true if the item provides is a string containing something other then white space.

signature:
```
    string => boolean
```

#### base.isPath ####
This function determins if the string given meets the regex for a valid path. This returns true if the string could be a valid path.

signature:
```
    path:string => boolean
```

#### base.isDistinctItemArray ####
This function determins if this is an array containing items with no duplicates. This returns true if the array is empty or contains only unique items.

signature:
```
    array => boolean
```

#### base.arrayHasDuplicates ####
This function determines if an array has duplicate items. This uses the triple equals (===) comparison to determine if an array has duplicate items. This function returns true if the given array has duplicates.

signature:
```
    array => boolean
```

### ip4 ###
This exposes functions to validate an IP4 address string and its parts.

Functions Provided:

[ip4.isIp4String](#ip4.isIp4String)</br>
[ip4.isOctet](#ip4.isOctet)</br>

#### ip4.isIp4String ####
This function will validate if a string is a valid IP4 address string. Returns true if the string is formatted correctly.

signature:
```
    ip4_address:string => boolean
```

#### ip4.isOctet ###
This function will return whether or not a string is a valid IP4 address octet. It must be a string contaning a number between 1 and 255. This returns true if the string is a valid octet.

signature:
```
    ip4_octet:string => boolean
```

### knex ###
This gives types for dealing with [knexjs](http://knexjs.org) and methods related those types.

Its members are:

[knex.baseTypes](#knex.baseTypes)</br>
[knex.getKnexConnectionDef](#knex.getKnexConnectionDef)</br>
[knex.getKnexConstructorDef](#knex.getKnexConstructorDef)</br>
[knex.isKnexConstructor](#knex.isKnexConstructor)</br>
[knex.getConstuctorParameterErrors](#knex.getConstuctorParameterErrors)</br>
[knex.getConstructorParameterErrorMessage](#knex.getConstructorParameterErrorMessage)

#### knex.baseTypes ###
This structure represents the types used to build up [knexjs](http://knexjs.org) types and the functions to validate them.

Members are:

[knex.baseTypes.getConnectionPoolDef](#knex.baseTypes.getConnectionPoolDef)</br>
[knex.baseTypes.getConnectionPoolErrors](#knex.baseTypes.getConnectionPoolErrors)</br>
[knex.baseTypes.allowedDatabases](#knex.baseTypes.allowedDatabases)</br>
[knex.baseTypes.isClient](#knex.baseTypes.isClient)

##### knex.baseTypes.getConnectionPoolDef #####
This function returns the deffinition for a connection pool object to be used in the [knexjs](http://knexjs.org) constructor.

signature:
```
    () => connectionPoolDef
```

The deffinition is:
```
    {
        minMax: { min:0 - Infinity, max: 0 - Infinity },
        afterCreate: { 
            afterCreate: 'connectionMethodForConnectionPool' 
        },
    }
```

##### knex.baseTypes.getConnectionPoolErrors #####
This function takes a connection pool object and returns an array of type validation error. This function returns an empty array if there are no errors.

These errors are defined in [typesValidation.js](#typesValidation.md).

signature:
```
    Object => array<typeError>
```

##### knex.baseTypes.allowedDatabases #####
This is a list of database that Joyeuse is allowed to conncet to. The current list is:

* postgres
* mssql
* mysql
* mariadb
* sqlite3
* oracle

##### knex.baseTypes.isClient #####
This function determines if a given string is one of the [allowed databases](#knex.baseTypes.allowedDatabases). This function returns true if the string given is in the list of allowed databases.

signature:
```
    string => boolean
```


#### knex.getKnexConnectionDef ####
This function returns the definition for the connection type used by [knexjs](http:/knexjs.org/) as part of its constructor.

signature:
```
    () => connectionDef
```

The definition is:
```
    {
        objectDef: optional {
            host: optional IP4 string,
            socketPath: optional path,
            user: requiredString,
            password: optional requiredString,
            database: requiredString,
        },
        pathObjectDef: optional {
            filename: typeNames.path,
        },
        connectionStringDef: optional requiredString,
    }
```

The connection must have either: the object defined, the path object defined or the connection string defined.

The if using a connection object, the connection object must have either the host or the socket path.

#### knex.getKnexConstructorDef ####
This function gets the definition of the constructor used by [knexjs](http://knexjs.org/).

signature:
```
    () => constructorDef
```

The definition is:
```
    {
        client: allowed database,
        searchPath: optional requiredString,
        debug: optional boolean,
        acquireConnectionTimeout: optional int 0-Infinity,
        connection: connectionDef
    }
```

#### knex.isKnexConstructor ####
This function validates an object to determine if it is a [knexjs](http://knexjs.org/) constructor parameter. This parameter is defined in [knex.getKnexConstructorDef](#knex.getKnexConstructorDef). This function returns true if the object passes validation.

signature:
```
    Object => boolean
```
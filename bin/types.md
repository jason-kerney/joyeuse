# types-js #

## Joyeuse Types ##

This file holds all the types that are the building blocks of Joyeuse.

example:
```javascript
    var typeNames = require('joyeuse').types;
```

Types members are:

[typeNames](#typenames)</br>
[base](#base)</br>
[ip4](#ip4)</br>
[knex](#knex)</br>
[joyeuse](#joyeuse)</br>

### typeNames ###

These are all the exposed type names. They are:

[typeNames.validType](#typenames-validtype)</br>
[typeNames.requiredString](#typenames-requiredstring)</br>
[typeNames.path](#typenames-path)</br>
[typeNames.distinctItemArray](#typenames-distinctitemarray)</br>
[typeNames.ip4.format](#typenames-ip4-format)</br>
[typeNames.knex.clients](#typenames-knex-clients)</br>
[typeNames.knex.knexConstructorParam](#typenames-knex-knexconstructorparam)</br>
[typeNames.joyeuse.columnFlags](#typenames-joyeuse-columnflags)

#### typeNames-validType ###
This is the name of a type that represents a string containing a name of a registerd [signet](https://www.npmjs.com/package/signet) type.

#### typeNames-requiredString ####
This is the name of the type that requires a non-zero length string.

#### typeNames-path ####
This is the name of the type that requires a string representing a valid path.

#### typeNames-distinctItemArray ####
This is the name of the type that represents an array of non-duplicate items.

#### typeNames-ip4-format ####
This is the name of the type representing a string formatted as an IP4 address.

#### typeNames-knex-clients ####
This is the name of the type for a string field that is restricted to the list of [Knex](http://knexjs.org/) supported clients.

#### typeNames-knex-knexConstructorParam ####
This is the name of the type that is used to construct [Knex](http://knexjs.org/) and also used to construct the [Joyeuse Factory](joyeuse.md#getfactory).

#### typeNames-joyeuse-columnFlags ####
This is the name of the type that represents the unique array of valid column flags.

### base ###
This contains methods used to validate base types give directly off of [typeNames](#typenames).

Functions Provided:

[base.isRequiredString](#base-isrequiredstring)</br>
[base.isPath](#base-ispath)</br>
[base.isDistinctItemArray](#base-isdistinctitemarray)</br>
[base.arrayHasDuplicates](#base-arrayhasduplicates)</br>

#### base-isRequiredString ###
This function determines if a given string is a [required string](#typenames-requiredstring). Meaning it is a non-zero length string containing more then white space. This returns true if the item provides is a string containing something other then white space.

signature:
```
    string => boolean
```

#### base-isPath ####
This function determines if the string given meets the regex for a valid path. This returns true if the string could be a valid path.

signature:
```
    path:string => boolean
```

#### base-isDistinctItemArray ####
This function determines if this is an array containing items with no duplicates. This returns true if the array is empty or contains only unique items.

signature:
```
    array => boolean
```

#### base-arrayHasDuplicates ####
This function determines if an array has duplicate items. This uses the triple equals (===) comparison to determine if an array has duplicate items. This function returns true if the given array has duplicates.

signature:
```
    array => boolean
```

### ip4 ###
This exposes functions to validate an IP4 address string and its parts.

Functions Provided:

[ip4.isIp4String](#ip4-isip4string)</br>
[ip4.isOctet](#ip4-isoctet)</br>

#### ip4-isIp4String ####
This function will validate if a string is a valid IP4 address string. Returns true if the string is formatted correctly.

signature:
```
    ip4_address:string => boolean
```

#### ip4-isOctet ###
This function will return whether or not a string is a valid IP4 address octet. It must be a string containing a number between 1 and 255. This returns true if the string is a valid octet.

signature:
```
    ip4_octet:string => boolean
```

### knex ###
This gives types for dealing with [knexjs](http://knexjs.org) and methods related those types.

Its members are:

[knex.baseTypes](#knex-basetypes)</br>
[knex.getKnexConnectionDef](#knex-getknexconnectiondef)</br>
[knex.getKnexConstructorDef](#knex-getknexconstructordef)</br>
[knex.isKnexConstructor](#knex-isknexconstructor)</br>
[knex.getConstructorParameterErrors](#knex-getconstuctorparametererrors)</br>
[knex.getConstructorParameterErrorMessage](#knex-getconstructorparametererrormessage)

#### knex-baseTypes ###
This structure represents the types used to build up [knexjs](http://knexjs.org) types and the functions to validate them.

Members are:

[knex.baseTypes.getConnectionPoolDef](#knex-basetypes-getconnectionpooldef)</br>
[knex.baseTypes.getConnectionPoolErrors](#knex-basetypes-getconnectionpoolerrors)</br>
[knex.baseTypes.allowedDatabases](#knex-basetypes-alloweddatabases)</br>
[knex.baseTypes.isClient](#knex-basetypes-isclient)

##### knex-baseTypes-getConnectionPoolDef #####
This function returns the definition for a connection pool object to be used in the [knexjs](http://knexjs.org) constructor.

signature:
```
    () => connectionPoolDef
```

The definition is:
```
    {
        minMax: { min:0-Infinity, max: 0-Infinity },
        afterCreate: { 
            afterCreate: 'connectionMethodForConnectionPool' 
        },
    }
```

##### knex-baseTypes-getConnectionPoolErrors #####
This function takes a connection pool object and returns an array of type validation error. This function returns an empty array if there are no errors.

These errors are defined in [typesValidation.js](#typesvalidation.md).

signature:
```
    Object => array<typeError>
```

##### knex-baseTypes-allowedDatabases #####
This is a list of database that Joyeuse is allowed to connect to. The current list is:

* postgres
* mssql
* mysql
* mariadb
* sqlite3
* oracle

##### knex-baseTypes-isClient #####
This function determines if a given string is one of the [allowed databases](#knex-basetypes-alloweddatabases). This function returns true if the string given is in the list of allowed databases.

signature:
```
    string => boolean
```


#### knex-getKnexConnectionDef ####
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

#### knex-getKnexConstructorDef ####
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

#### knex-isKnexConstructor ####
This function validates an object to determine if it is a [knexjs](http://knexjs.org/) constructor parameter. This parameter is defined in [knex.getKnexConstructorDef](#knex-getknexconstructordef). This function returns true if the object passes validation.

signature:
```
    Object => boolean
```

#### knex-getConstructorParameterErrors ####
This function validates an object to determine if it is a valid parameter for the constructor of [knexjs](http://knexjs.org/). It then returns an array of type errors. This function returns an empty array if the type is valid.

signature:
```
    Object => array<typeError>
```

#### knex-getConstructorParameterErrorMessage ####
This function validates an object to determine if it is a valid parameter for the constructor of [knexjs](http://knexjs.org/). This function returns a nice error message constructed from type errors. This function returns an empty string if there are no errors.

signature:
```
    Object => string
```

### joyeuse ###
This represents joyeuse types and methods describing and validating those types.

It's members are:

[joyeuse.columnDefinitionType](joyuse-columndefinitiontype)</br>
[joyeuse.columnFlags](joyuse-columnflags)</br>
[joyeuse.getColumnDefinitionTypeErrors](joyuse-getColumndefinitiontypeerrors)</br>
[joyeuse.isColumnFlag](joyuse-iscolumnflag)</br>
[joyeuse.isJoyeuseColumnDefinition](joyuse-isJoyeusecolumndefinition)</br>
[joyeuse.getColumnDefinitionBuilder](joyuse-getcolumndefinitionbuilder)

#### joyeuse-columnDefinitionType ####
This returns the definition of the type that is used to define a column in the database.

signature:
```
    () => columnDefinitionType
```

The definition is:
```
    {
        type: validType,
        flags: array<columnFlag>,
    }
```

#### joyeuse-columnFlags ####
This is an array of valid flags for a column definition.

The valid flags are:

* readonly
* hidden

#### joyeuse-getColumnDefinitionTypeErrors ####
This function validates an object as a columnDefinition and returns an array of type errors. This function returns an empty array if the type is valid.

signature:
```
    Object => array<typeErrors>
```

#### joyeuse-isColumnFlag ####
This function is used to determine if a given string is a valid column flag. It returns true if the string is a column flag.

signature:
```
    string => boolean
```

#### joyeuse-isJoyeuseColumnDefinition ####
This function validates if an object is a column definition. It returns true if the object is a column definition.

signature:
```
    Object => boolean
```

#### joyeuse-getColumnDefinitionBuilder ####
This function gets a builder to construct a valid column definition.

signature:
```
    validType => columnDefinitionBuilder
```

returns:
```
    {
        type: validTypeName,
        flags: array<columnFlags>,
        hidden: () => columnDefinitionBuilder,
        readonly: () => columnDefinitionBuilder,
        init: ( () => columnDefinitionBuilder.type ) => columnDefinitionBuilder
    }
```

_hidden:_ adds 'hidden' to the flags array if it does not exist.
_readonly:_ adds 'readonly' to the flags array if it does not exist.
_init:_ takes a function that returns the type named in the type field. This is will be used to create the initial value for the column.
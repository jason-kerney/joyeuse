# joyeuse.js #

## Joyeuse Main File ##
This is the main module for joyeuse and contains all of its publicly exposed items.

Joyeuse members are:

[getFactory](#getfactory)</br>

### getFactory ###
This function returns the object that will be used to build the definition of the database objects. This function takes a [knexjs constructor](types.md#typenames-knex-knexconstructorparam).

signature:
```
    knexConstructorParameter => factory
```

returns:
```
    {
        type: string => columnDefinitionBuilder,
        types: types.js,
        typeBuilder: typeBuilder.js,
        signet: typeBuilder.signet
        knex: knex
    }
```

_type:_ is a function that allows for the creation of a column definition
_types:_ [types.js](types.md)
_typeBuilder:_ [typeBuilder.js](typebuilder.md)
_signet:_ [typeBuilder.signet](typebuilder.md#signet)
_knex:_ is the [knexjs](http://knexjs.org/) constructed by joyeuse.
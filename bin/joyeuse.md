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
        knex: knex
    }
```

_knex:_ is the [knexjs](http://knexjs.org/) constructed by joyeuse.
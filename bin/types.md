# types.js #

## Joyeuse Types ##

This file holds all the types that are the building blocks of Joyeuse.

example:
```javascript
    var typeNames = require('joyeuse').types;
```

### typeNames ###

These are all the exposed type names. They are:

[typeNames.requiredString](typeNames.requiredString)</br>
[typeNames.path](typeNames.path)</br>
[typeNames.distinctItemArray](typeNames.distinctItemArray)</br>
[typeNames.validType](typeNames.validType)</br>
[typeNames.ip4.format](typeNames.ip4.format)</br>
[typeNames.knex.clients](typeNames.knex.clients)</br>
[typeNames.knex.knexConstructorParam](typeNames.knex.knexConstructorParam)</br>
[typeNames.joyeuse.columnFlags](typeNames.joyeuse.columnFlags)

#### typeNames.requiredString ####
This is the name of the type that requires a non-zero length string.

#### typeNames.path ####
This is the name of the type that requires a string representing a valid path.

#### typeNames.distinctItemArray ####
This is the name of the type that represents an array of non-duplicate items.

#### typeNames.validType ###
This is the name of a type that represents a string containing a name of a registerd [signet](https://www.npmjs.com/package/signet) type.
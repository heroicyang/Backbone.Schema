[npm-badge]: https://badge.fury.io/js/backbone.schema.png
[npm-link]: https://badge.fury.io/js/backbone.schema

[travis-badge]: https://secure.travis-ci.org/DreamTheater/Backbone.Schema.png
[travis-link]: https://travis-ci.org/DreamTheater/Backbone.Schema

[gemnasium-badge]: https://gemnasium.com/DreamTheater/Backbone.Schema.png
[gemnasium-link]: https://gemnasium.com/DreamTheater/Backbone.Schema

# Backbone.Schema

[![NPM Version][npm-badge]][npm-link]
[![Build Status][travis-badge]][travis-link]
[![Dependency Status][gemnasium-badge]][gemnasium-link]

This plugin allow you define schemas for your models. It provides type control, computable properties, references between models and collections, filters and localization.

**Dependencies:**

  - [Backbone](https://github.com/documentcloud/backbone) `>= 1.1.0`
  - [Underscore](https://github.com/documentcloud/underscore) `>= 1.5.2`
  - [Moment](https://github.com/moment/moment/) `>= 2.8.3`

## Getting Started
### Create model and schema
First you need to define model and schema.
```js
var model = new Backbone.Model(), schema = new Backbone.Schema(model);
```

### Define properties
Now you got instances of model and schema and you can start defining properties of the model. Use `schema.define(attribute, options)` method to do it.

#### Option `type`
##### Type `string`
Converts value to string. Represents as is.
```js
schema.define('string-property', { type: 'string' });

model.set('string-property', 999999.99); // --> "999999.99"
model.get('string-property'); // <-- "999999.99"
```

##### Type `boolean`
Converts value to boolean. Represents as is.
```js
schema.define('boolean-property', { type: 'boolean' });

model.set('boolean-property', 'true'); // --> true
model.get('boolean-property'); // <-- true
```

##### Type `number`
Converts value to number. Represents as is.

```js
schema.define('number-property', { type: 'number' });

model.set('number-property', '999999.99'); // --> 999999.99
model.get('number-property'); // <-- 999999.99
```

##### Type `datetime`
Converts value to [Date](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date), [ISO 8601](http://en.wikipedia.org/wiki/ISO_8601), or [Unix time](http://en.wikipedia.org/wiki/Unix_time). Represents as is, or as formatted string (depends from option `format`).

**Additional options:**
  - `format` - see more about [moment formatting](http://momentjs.com/docs/#/displaying/format/)
  - `standard` (available values are `iso` and `unix`) - defines in which way date will be stored in the model (if not specified, date will be stored as [Date](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date))

```js
schema.define('datetime-property', { type: 'datetime', format: 'YYYY-MM-DD', standard: 'unix' });

model.set('datetime-property', new Date('2014/10/23')); // --> 1413993600
model.get('datetime-property'); // <-- "2014-10-23"
```

### Define properties of array type
#### Option `array`
Besides listed above data types you can define arrays. To do this just use option `array` instead of `type`. For example: `{ array: 'string' }`, `{ array: 'number' }` etc. In this case each item in array will be processed by corresponding handler.

### Define computed property
You can define a computed properties with your own custom logic.

#### Options `getter` and `setter`
Manipulate these two options to describe behavior of a computed property.
```js
var User = Backbone.Model.extend({
    initialize: function () {
        var schema = new Backbone.Schema(this);

        schema.define('fullName', {
            getter: function (attribute, value) {
                var firstName = this.model.get('firstName'),
                    lastName = this.model.get('lastName');

                return firstName + ' ' + lastName;
            },

            setter: function (attribute, value) {
                var fullName = value.match(/\S+/g);

                return {
                    firstName: fullName[0],
                    lastName: fullName[1]
                };
            }
        });
    }
});
```
```js
var user = new User({
    firstName: 'Dmytro',
    lastName: 'Nemoga'
});

user.get('fullName'); // <-- "Dmytro Nemoga"
user.set('fullName', 'Andriy Serputko'); // --> firstName: "Andriy", lastName: "Serputko"
```

### Define nested models and collections
#### Option `model`
Converts value to model, using value as a set of attributes. Represents as is.

**Additional options:**
  - `clear` - if `true`, model removes an existing attributes before setting new (otherwise merges them)

```js
schema.define('nested-model', { model: Backbone.Model });

model.set('nested-model', { id: 0, value: 'foo' }); // --> new Backbone.Model({ id: 0, value: 'foo' })
model.get('nested-model'); // <-- instance of Backbone.Model
```

#### Option `collection`
Converts value to collection, using value as a set of attributes. Represents as is.

**Additional options:**
  - `reset` - if `true`, collection removes an existing models before creating new (otherwise merges them)

```js
schema.define('nested-collection', { collection: Backbone.Collection });

model.set('nested-collection', [ // --> new Backbone.Collection([
    { id: 1, value: 'bar' },     //         { id: 1, value: 'bar' },
    { id: 2, value: 'baz' },     //         { id: 2, value: 'baz' },
    { id: 3, value: 'qux' }      //         { id: 3, value: 'qux' }
]);                              //     ])

model.get('nested-collection'); // <-- instance of Backbone.Collection
```

### Define reference models and collections
Before using reference models or collections make sure that you have a source collection.
```js
var sourceCollection = new Backbone.Collection([
    { id: 0, value: 'foo' },
    { id: 1, value: 'bar' },
    { id: 2, value: 'baz' },
    { id: 3, value: 'qux' }
]);
```

#### Option `source`
If you pass collection in this option, plugin tries to get model from it.

##### Type `model`
Converts value (a model ID in the source collection) to model, keeping reference to original model. Represents as is.
```js
schema.define('reference-model', { type: 'model', source: sourceCollection });

model.set('reference-model', 0); // --> sourceCollection.get(0)
model.get('reference-model'); // <-- instance of Backbone.Model
```

##### Type `collection`
Converts value (a set of model IDs in the source collection) to collection, keeping references to original models. Represents as is.
```js
schema.define('reference-collection', { type: 'collection', source: sourceCollection });

model.set('reference-collection', [ // --> new Backbone.Collection([
    1,                              //         sourceCollection.get(1),
    2,                              //         sourceCollection.get(2),
    3                               //         sourceCollection.get(3)
]);                                 //     ])

model.get('reference-collection'); // <-- instance of Backbone.Collection
```

### Keeping integrity
The plugin prevents setting `undefined` values, instead of this it assigns a default value or `null` for regular properties, `{}` for models and `[]` for collections and arrays.

## Changelog
### 0.5.0
  - Removed [Globalize](https://github.com/jquery/globalize)
  - Added [Moment.js](https://github.com/moment/moment/) to manipulate `datetime` type

### 0.4.9
  - Fixed issue with nested models and collections

### 0.4.8
  - `Backbone.Schema` could be extended

### 0.4.7
  - Added CommonJS support

### 0.4.6
  - Removed `text` type
  - `number` and `datetime` requires `format` option for string output

### 0.4.4
  - Fixed behavior for `model` and `collection` types

### 0.4.3
  - Renaming option `reset` to `clear` for `model` type
  - Changed default behavior for `model` and `collection` types

### 0.4.1
  - Renaming `types` to `handlers`
  - Method `refresh` moved from model to schema
  - Removed backward reference to schema

### 0.3.8
  - `refresh` affects only registered attributes
  - `model` and `collection` attributes cannot be `null`

### 0.3.6
  - Option `arrayOf` renamed to `array`
  - Option `fromSource` renamed to `source`

### 0.3.4
  - Added option to use a custom culture

### 0.3.3
  - Fixed serious issue with `model` type

### 0.3.2
  - Handlers `currency` and `percent` merged into `number`

### 0.3.1
  - Plugin implemented as decorator, not a class
  - Option `reset` for `model` and `collection` types

### 0.2.9
  - Properties are configurable with additional options
  - Formatters and converters merged into types
  - Added support of reference models and collections
  - A lot of fixes

### 0.2.5
  - Added support of nested models and collections

### 0.2.4
  - Support of arrays
  - Added type `locale`
  - Removed method `toJSON`

### 0.2.1
  - Formatters and converters takes only `value` argument

### 0.2.0
  - Static methods runs in correct context, now they may be used as independent helpers

### 0.1.9
  - Properties `formatters` and `converters` is static

### 0.1.8
  - Removed CommonJS support

### 0.1.7
  - Added CommonJS support

### 0.1.6
  - Integration with project **Backbone.Accessors**
  - Method `defineProperty` renamed to `property`
  - Methods `addGetter`/`addSetter` merged to method `computed`
  - Option `advanced` of `toJSON` method renamed to `schema`

### 0.1.2
  - Removed argument `options` of `defineProperty` method's

### 0.1.1
  - Method `addProperty` renamed to `defineProperty`

### 0.1.0
  - Initial release


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/DreamTheater/backbone.schema/trend.png)](https://bitdeli.com/free "Bitdeli Badge")


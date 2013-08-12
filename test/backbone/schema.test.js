(function () {
    'use strict';

    ///////////////////
    // PREREQUISITES //
    ///////////////////

    var Model = Backbone.Model.extend({
            defaults: {
                'string-property': 'default',
                'boolean-property': false,
                'number-property': 0,
                'datetime-property': '2012-12-12T00:00:00.000Z',
                'locale-property': 'default',
                'text-property': 'default'
            },

            initialize: function () {
                var schema = this.schema = Backbone.Schema(this);

                schema.define({
                    'string-property': { type: 'string' },
                    'boolean-property': { type: 'boolean' },
                    'number-property': { type: 'number' },
                    'datetime-property': { type: 'datetime' },
                    'locale-property': { type: 'locale' },
                    'text-property': { type: 'text' },

                    'array-of-strings': { array: 'string' },
                    'array-of-booleans': { array: 'boolean' },
                    'array-of-numbers': { array: 'number' },
                    'array-of-datetimes': { array: 'datetime' },
                    'array-of-locales': { array: 'locale' },
                    'array-of-texts': { array: 'text' },

                    'nested-model': { model: Backbone.Model, clear: true },
                    'nested-collection': { collection: Backbone.Collection },

                    'reference-model': { type: 'model', source: sourceCollection, clear: true },
                    'reference-collection': { type: 'collection', source: sourceCollection }
                });

                schema.define('typeless-property');
            }
        }),

        sourceCollection = new Backbone.Collection();

    Globalize.addCultureInfo('en', {
        messages: {
            'HELLO_WORLD': 'Hello, World!'
        }
    });

    ////////////
    // MODULE //
    ////////////

    module('Backbone.Schema', {
        setup: function () {
            sourceCollection.reset([
                { id: 0, value: 'foo' },
                { id: 1, value: 'bar' },
                { id: 2, value: 'baz' },
                { id: 3, value: 'qux' }
            ]);

            this.model = new Model({
                'string-property': 'string',
                'boolean-property': true,
                'number-property': 999999.99,
                'datetime-property': '2012-12-12T00:00:00.000Z',
                'locale-property': 'HELLO_WORLD',
                'text-property': '&lt;b&gt;text&lt;/b&gt;',

                'array-of-strings': ['string'],
                'array-of-booleans': [true],
                'array-of-numbers': [999999.99],
                'array-of-datetimes': ['2012-12-12T00:00:00.000Z'],
                'array-of-locales': ['HELLO_WORLD'],
                'array-of-texts': ['&lt;b&gt;text&lt;/b&gt;'],

                'nested-model': { id: 0, value: 'foo' },
                'nested-collection': [
                    { id: 1, value: 'bar' },
                    { id: 2, value: 'baz' },
                    { id: 3, value: 'qux' }
                ],

                'reference-model': 0,
                'reference-collection': [1, 2, 3]
            });
        }
    });

    ///////////
    // TESTS //
    ///////////

    test('initialize with attributes', function () {
        var attributes = this.model.attributes;

        strictEqual(attributes['string-property'], 'string');
        strictEqual(attributes['boolean-property'], true);
        strictEqual(attributes['number-property'], 999999.99);
        strictEqual(attributes['datetime-property'], '2012-12-12T00:00:00.000Z');
        strictEqual(attributes['locale-property'], 'HELLO_WORLD');
        strictEqual(attributes['text-property'], '&lt;b&gt;text&lt;/b&gt;');

        deepEqual(attributes['array-of-strings'], ['string']);
        deepEqual(attributes['array-of-booleans'], [true]);
        deepEqual(attributes['array-of-numbers'], [999999.99]);
        deepEqual(attributes['array-of-datetimes'], ['2012-12-12T00:00:00.000Z']);
        deepEqual(attributes['array-of-locales'], ['HELLO_WORLD']);
        deepEqual(attributes['array-of-texts'], ['&lt;b&gt;text&lt;/b&gt;']);

        deepEqual(attributes['nested-model'].toJSON(), { id: 0, value: 'foo' });
        deepEqual(attributes['nested-collection'].toJSON(), [
            { id: 1, value: 'bar' },
            { id: 2, value: 'baz' },
            { id: 3, value: 'qux' }
        ]);

        deepEqual(attributes['reference-model'].toJSON(), { id: 0, value: 'foo' });
        deepEqual(attributes['reference-collection'].toJSON(), [
            { id: 1, value: 'bar' },
            { id: 2, value: 'baz' },
            { id: 3, value: 'qux' }
        ]);

        strictEqual(attributes['typeless-property'], null);
    });

    test('toJSON receives attributes during save', function () {
        var json = this.model.toJSON();

        deepEqual(json, {
            'string-property': 'string',
            'boolean-property': true,
            'number-property': 999999.99,
            'datetime-property': '2012-12-12T00:00:00.000Z',
            'locale-property': 'HELLO_WORLD',
            'text-property': '&lt;b&gt;text&lt;/b&gt;',

            'array-of-strings': ['string'],
            'array-of-booleans': [true],
            'array-of-numbers': [999999.99],
            'array-of-datetimes': ['2012-12-12T00:00:00.000Z'],
            'array-of-locales': ['HELLO_WORLD'],
            'array-of-texts': ['&lt;b&gt;text&lt;/b&gt;'],

            'nested-model': { id: 0, value: 'foo' },
            'nested-collection': [
                { id: 1, value: 'bar' },
                { id: 2, value: 'baz' },
                { id: 3, value: 'qux' }
            ],

            'reference-model': 0,
            'reference-collection': [1, 2, 3],

            'typeless-property': null
        });
    });

    test('get string property', function () {
        var stringProperty = this.model.get('string-property');

        strictEqual(stringProperty, 'string');
    });

    test('get boolean property', function () {
        var booleanProperty = this.model.get('boolean-property');

        strictEqual(booleanProperty, true);
    });

    test('get number property', function () {
        var numberProperty = this.model.get('number-property');

        strictEqual(numberProperty, '999,999.99');
    });

    test('get datetime property', function () {
        var datetimeProperty = this.model.get('datetime-property');

        strictEqual(datetimeProperty, '12/12/2012');
    });

    test('get locale property', function () {
        var localeProperty = this.model.get('locale-property');

        strictEqual(localeProperty, 'Hello, World!');
    });

    test('get text property', function () {
        var textProperty = this.model.get('text-property');

        strictEqual(textProperty, '<b>text</b>');
    });

    test('get array of strings', function () {
        var arrayOfStrings = this.model.get('array-of-strings');

        deepEqual(arrayOfStrings, ['string']);
    });

    test('get array of booleans', function () {
        var arrayOfBooleans = this.model.get('array-of-booleans');

        deepEqual(arrayOfBooleans, [true]);
    });

    test('get array of numbers', function () {
        var arrayOfNumbers = this.model.get('array-of-numbers');

        deepEqual(arrayOfNumbers, ['999,999.99']);
    });

    test('get array of datetimes', function () {
        var arrayOfDatetimes = this.model.get('array-of-datetimes');

        deepEqual(arrayOfDatetimes, ['12/12/2012']);
    });

    test('get array of locales', function () {
        var arrayOfLocales = this.model.get('array-of-locales');

        deepEqual(arrayOfLocales, ['Hello, World!']);
    });

    test('get array of texts', function () {
        var arrayOfTexts = this.model.get('array-of-texts');

        deepEqual(arrayOfTexts, ['<b>text</b>']);
    });

    test('get nested model', function () {
        var nestedModel = this.model.get('nested-model');

        deepEqual(nestedModel.toJSON(), { id: 0, value: 'foo' });
    });

    test('get nested collection', function () {
        var nestedCollection = this.model.get('nested-collection');

        deepEqual(nestedCollection.toJSON(), [
            { id: 1, value: 'bar' },
            { id: 2, value: 'baz' },
            { id: 3, value: 'qux' }
        ]);
    });

    test('get reference model', function () {
        var referenceModel = this.model.get('reference-model');

        strictEqual(referenceModel, sourceCollection.get(0));
    });

    test('get reference collection', function () {
        var referenceCollection = this.model.get('reference-collection');

        deepEqual(referenceCollection.models, [
            sourceCollection.get(1),
            sourceCollection.get(2),
            sourceCollection.get(3)
        ]);
    });

    test('get typeless property', function () {
        var typelessProperty = this.model.get('typeless-property');

        strictEqual(typelessProperty, null);
    });

    test('get undefined property', function () {
        var undefinedProperty = this.model.get('undefined-property');

        strictEqual(undefinedProperty, undefined);
    });

    test('set and unset string property', function () {
        var attribute = 'string-property', model = this.model, attributes = model.attributes,

            date = new Date('12/12/2012'), array = [], object = {};

        model.set(attribute, 'string');
        strictEqual(attributes[attribute], 'string');

        model.set(attribute, '');
        strictEqual(attributes[attribute], '');

        model.set(attribute, 999999.99);
        strictEqual(attributes[attribute], '999999.99');

        model.set(attribute, 0);
        strictEqual(attributes[attribute], '0');

        model.set(attribute, true);
        strictEqual(attributes[attribute], 'true');

        model.set(attribute, false);
        strictEqual(attributes[attribute], 'false');

        model.set(attribute, date);
        strictEqual(attributes[attribute], date.toString());

        model.set(attribute, array);
        strictEqual(attributes[attribute], '');

        model.set(attribute, object);
        strictEqual(attributes[attribute], '[object Object]');

        model.set(attribute, null);
        strictEqual(attributes[attribute], null);

        model.set(attribute, undefined);
        strictEqual(attributes[attribute], 'default');

        model.unset(attribute);
        ok(!_.has(attributes, attribute));
    });

    test('set and unset boolean property', function () {
        var attribute = 'boolean-property', model = this.model, attributes = model.attributes,

            date = new Date('12/12/2012'), array = [], object = {};

        model.set(attribute, 'true');
        strictEqual(attributes[attribute], true);

        model.set(attribute, '');
        strictEqual(attributes[attribute], false);

        model.set(attribute, 999999.99);
        strictEqual(attributes[attribute], true);

        model.set(attribute, 0);
        strictEqual(attributes[attribute], false);

        model.set(attribute, true);
        strictEqual(attributes[attribute], true);

        model.set(attribute, false);
        strictEqual(attributes[attribute], false);

        model.set(attribute, date);
        strictEqual(attributes[attribute], true);

        model.set(attribute, array);
        strictEqual(attributes[attribute], true);

        model.set(attribute, object);
        strictEqual(attributes[attribute], true);

        model.set(attribute, null);
        strictEqual(attributes[attribute], null);

        model.set(attribute, undefined);
        strictEqual(attributes[attribute], false);

        model.unset(attribute);
        ok(!_.has(attributes, attribute));
    });

    test('set and unset number property', function () {
        var attribute = 'number-property', model = this.model, attributes = model.attributes,

            date = new Date('12/12/2012'), array = [], object = {};

        model.set(attribute, '999,999.99');
        strictEqual(attributes[attribute], 999999.99);

        model.set(attribute, '');
        strictEqual(attributes[attribute], 0);

        model.set(attribute, 999999.99);
        strictEqual(attributes[attribute], 999999.99);

        model.set(attribute, 0);
        strictEqual(attributes[attribute], 0);

        model.set(attribute, true);
        ok(isNaN(attributes[attribute]));

        model.set(attribute, false);
        ok(isNaN(attributes[attribute]));

        model.set(attribute, date);
        ok(isNaN(attributes[attribute]));

        model.set(attribute, array);
        strictEqual(attributes[attribute], 0);

        model.set(attribute, object);
        ok(isNaN(attributes[attribute]));

        model.set(attribute, null);
        strictEqual(attributes[attribute], null);

        model.set(attribute, undefined);
        strictEqual(attributes[attribute], 0);

        model.unset(attribute);
        ok(!_.has(attributes, attribute));
    });

    test('set and unset datetime property', function () {
        var attribute = 'datetime-property', model = this.model, attributes = model.attributes,

            date = new Date('12/12/2012'), array = [], object = {};

        model.set(attribute, '12/12/2012');
        strictEqual(attributes[attribute], date.toISOString());

        model.set(attribute, '');
        strictEqual(attributes[attribute], 'Invalid Date');

        model.set(attribute, 999999.99);
        strictEqual(attributes[attribute], '1970-01-01T00:16:39.999Z');

        model.set(attribute, 0);
        strictEqual(attributes[attribute], '1970-01-01T00:00:00.000Z');

        model.set(attribute, true);
        strictEqual(attributes[attribute], '1970-01-01T00:00:00.001Z');

        model.set(attribute, false);
        strictEqual(attributes[attribute], '1970-01-01T00:00:00.000Z');

        model.set(attribute, date);
        strictEqual(attributes[attribute], date.toISOString());

        model.set(attribute, array);
        strictEqual(attributes[attribute], 'Invalid Date');

        model.set(attribute, object);
        strictEqual(attributes[attribute], 'Invalid Date');

        model.set(attribute, null);
        strictEqual(attributes[attribute], null);

        model.set(attribute, undefined);
        strictEqual(attributes[attribute], '2012-12-12T00:00:00.000Z');

        model.unset(attribute);
        ok(!_.has(attributes, attribute));
    });

    test('set and unset locale property', function () {
        var attribute = 'locale-property', model = this.model, attributes = model.attributes,

            date = new Date('12/12/2012'), array = [], object = {};

        model.set(attribute, 'Hello, World!');
        strictEqual(attributes[attribute], 'HELLO_WORLD');

        model.set(attribute, '');
        strictEqual(attributes[attribute], '');

        model.set(attribute, 999999.99);
        strictEqual(attributes[attribute], '999999.99');

        model.set(attribute, 0);
        strictEqual(attributes[attribute], '0');

        model.set(attribute, true);
        strictEqual(attributes[attribute], 'true');

        model.set(attribute, false);
        strictEqual(attributes[attribute], 'false');

        model.set(attribute, date);
        strictEqual(attributes[attribute], date.toString());

        model.set(attribute, array);
        strictEqual(attributes[attribute], '');

        model.set(attribute, object);
        strictEqual(attributes[attribute], '[object Object]');

        model.set(attribute, null);
        strictEqual(attributes[attribute], null);

        model.set(attribute, undefined);
        strictEqual(attributes[attribute], 'default');

        model.unset(attribute);
        ok(!_.has(attributes, attribute));
    });

    test('set and unset text property', function () {
        var attribute = 'text-property', model = this.model, attributes = model.attributes,

            date = new Date('12/12/2012'), array = [], object = {};

        model.set(attribute, '<b>text</b>');
        strictEqual(attributes[attribute], '&lt;b&gt;text&lt;/b&gt;');

        model.set(attribute, '');
        strictEqual(attributes[attribute], '');

        model.set(attribute, 999999.99);
        strictEqual(attributes[attribute], '999999.99');

        model.set(attribute, 0);
        strictEqual(attributes[attribute], '0');

        model.set(attribute, true);
        strictEqual(attributes[attribute], 'true');

        model.set(attribute, false);
        strictEqual(attributes[attribute], 'false');

        model.set(attribute, date);
        strictEqual(attributes[attribute], date.toString());

        model.set(attribute, array);
        strictEqual(attributes[attribute], '');

        model.set(attribute, object);
        strictEqual(attributes[attribute], '[object Object]');

        model.set(attribute, null);
        strictEqual(attributes[attribute], null);

        model.set(attribute, undefined);
        strictEqual(attributes[attribute], 'default');

        model.unset(attribute);
        ok(!_.has(attributes, attribute));
    });

    test('set and unset array of strings', function () {
        var attribute = 'array-of-strings', model = this.model, attributes = model.attributes,

            date = new Date('12/12/2012'), array = [], object = {};

        model.set(attribute, ['string']);
        deepEqual(attributes[attribute], ['string']);

        model.set(attribute, ['']);
        deepEqual(attributes[attribute], ['']);

        model.set(attribute, [999999.99]);
        deepEqual(attributes[attribute], ['999999.99']);

        model.set(attribute, [0]);
        deepEqual(attributes[attribute], ['0']);

        model.set(attribute, [true]);
        deepEqual(attributes[attribute], ['true']);

        model.set(attribute, [false]);
        deepEqual(attributes[attribute], ['false']);

        model.set(attribute, [date]);
        deepEqual(attributes[attribute], [date.toString()]);

        model.set(attribute, [array]);
        deepEqual(attributes[attribute], ['']);

        model.set(attribute, [object]);
        deepEqual(attributes[attribute], ['[object Object]']);

        model.set(attribute, [null]);
        deepEqual(attributes[attribute], [null]);

        model.set(attribute, [undefined]);
        deepEqual(attributes[attribute], [null]);

        model.set(attribute, []);
        deepEqual(attributes[attribute], []);

        model.set(attribute, null);
        deepEqual(attributes[attribute], []);

        model.set(attribute, undefined);
        deepEqual(attributes[attribute], []);

        model.unset(attribute);
        ok(!_.has(attributes, attribute));
    });

    test('set and unset array of booleans', function () {
        var attribute = 'array-of-booleans', model = this.model, attributes = model.attributes,

            date = new Date('12/12/2012'), array = [], object = {};

        model.set(attribute, ['true']);
        deepEqual(attributes[attribute], [true]);

        model.set(attribute, ['']);
        deepEqual(attributes[attribute], [false]);

        model.set(attribute, [999999.99]);
        deepEqual(attributes[attribute], [true]);

        model.set(attribute, [0]);
        deepEqual(attributes[attribute], [false]);

        model.set(attribute, [true]);
        deepEqual(attributes[attribute], [true]);

        model.set(attribute, [false]);
        deepEqual(attributes[attribute], [false]);

        model.set(attribute, [date]);
        deepEqual(attributes[attribute], [true]);

        model.set(attribute, [array]);
        deepEqual(attributes[attribute], [true]);

        model.set(attribute, [object]);
        deepEqual(attributes[attribute], [true]);

        model.set(attribute, [null]);
        deepEqual(attributes[attribute], [null]);

        model.set(attribute, [undefined]);
        deepEqual(attributes[attribute], [null]);

        model.set(attribute, []);
        deepEqual(attributes[attribute], []);

        model.set(attribute, null);
        deepEqual(attributes[attribute], []);

        model.set(attribute, undefined);
        deepEqual(attributes[attribute], []);

        model.unset(attribute);
        ok(!_.has(attributes, attribute));
    });

    test('set and unset array of numbers', function () {
        var attribute = 'array-of-numbers', model = this.model, attributes = model.attributes,

            date = new Date('12/12/2012'), array = [], object = {};

        model.set(attribute, ['999,999.99']);
        deepEqual(attributes[attribute], [999999.99]);

        model.set(attribute, ['']);
        deepEqual(attributes[attribute], [0]);

        model.set(attribute, [999999.99]);
        deepEqual(attributes[attribute], [999999.99]);

        model.set(attribute, [0]);
        deepEqual(attributes[attribute], [0]);

        model.set(attribute, [true]);
        deepEqual(attributes[attribute], [NaN]);

        model.set(attribute, [false]);
        deepEqual(attributes[attribute], [NaN]);

        model.set(attribute, [date]);
        deepEqual(attributes[attribute], [NaN]);

        model.set(attribute, [array]);
        deepEqual(attributes[attribute], [0]);

        model.set(attribute, [object]);
        deepEqual(attributes[attribute], [NaN]);

        model.set(attribute, [null]);
        deepEqual(attributes[attribute], [null]);

        model.set(attribute, [undefined]);
        deepEqual(attributes[attribute], [null]);

        model.set(attribute, []);
        deepEqual(attributes[attribute], []);

        model.set(attribute, null);
        deepEqual(attributes[attribute], []);

        model.set(attribute, undefined);
        deepEqual(attributes[attribute], []);

        model.unset(attribute);
        ok(!_.has(attributes, attribute));
    });

    test('set and unset array of datetimes', function () {
        var attribute = 'array-of-datetimes', model = this.model, attributes = model.attributes,

            date = new Date('12/12/2012'), array = [], object = {};

        model.set(attribute, ['12/12/2012']);
        deepEqual(attributes[attribute], [date.toISOString()]);

        model.set(attribute, ['']);
        deepEqual(attributes[attribute], ['Invalid Date']);

        model.set(attribute, [999999.99]);
        deepEqual(attributes[attribute], ['1970-01-01T00:16:39.999Z']);

        model.set(attribute, [0]);
        deepEqual(attributes[attribute], ['1970-01-01T00:00:00.000Z']);

        model.set(attribute, [true]);
        deepEqual(attributes[attribute], ['1970-01-01T00:00:00.001Z']);

        model.set(attribute, [false]);
        deepEqual(attributes[attribute], ['1970-01-01T00:00:00.000Z']);

        model.set(attribute, [date]);
        deepEqual(attributes[attribute], [date.toISOString()]);

        model.set(attribute, [array]);
        deepEqual(attributes[attribute], ['Invalid Date']);

        model.set(attribute, [object]);
        deepEqual(attributes[attribute], ['Invalid Date']);

        model.set(attribute, [null]);
        deepEqual(attributes[attribute], [null]);

        model.set(attribute, [undefined]);
        deepEqual(attributes[attribute], [null]);

        model.set(attribute, []);
        deepEqual(attributes[attribute], []);

        model.set(attribute, null);
        deepEqual(attributes[attribute], []);

        model.set(attribute, undefined);
        deepEqual(attributes[attribute], []);

        model.unset(attribute);
        ok(!_.has(attributes, attribute));
    });

    test('set and unset array of locales', function () {
        var attribute = 'array-of-locales', model = this.model, attributes = model.attributes,

            date = new Date('12/12/2012'), array = [], object = {};

        model.set(attribute, ['Hello, World!']);
        deepEqual(attributes[attribute], ['HELLO_WORLD']);

        model.set(attribute, ['']);
        deepEqual(attributes[attribute], ['']);

        model.set(attribute, [999999.99]);
        deepEqual(attributes[attribute], ['999999.99']);

        model.set(attribute, [0]);
        deepEqual(attributes[attribute], ['0']);

        model.set(attribute, [true]);
        deepEqual(attributes[attribute], ['true']);

        model.set(attribute, [false]);
        deepEqual(attributes[attribute], ['false']);

        model.set(attribute, [date]);
        deepEqual(attributes[attribute], [date.toString()]);

        model.set(attribute, [array]);
        deepEqual(attributes[attribute], ['']);

        model.set(attribute, [object]);
        deepEqual(attributes[attribute], ['[object Object]']);

        model.set(attribute, [null]);
        deepEqual(attributes[attribute], [null]);

        model.set(attribute, [undefined]);
        deepEqual(attributes[attribute], [null]);

        model.set(attribute, []);
        deepEqual(attributes[attribute], []);

        model.set(attribute, null);
        deepEqual(attributes[attribute], []);

        model.set(attribute, undefined);
        deepEqual(attributes[attribute], []);

        model.unset(attribute);
        ok(!_.has(attributes, attribute));
    });

    test('set and unset array of texts', function () {
        var attribute = 'array-of-texts', model = this.model, attributes = model.attributes,

            date = new Date('12/12/2012'), array = [], object = {};

        model.set(attribute, ['<b>text</b>']);
        deepEqual(attributes[attribute], ['&lt;b&gt;text&lt;/b&gt;']);

        model.set(attribute, ['']);
        deepEqual(attributes[attribute], ['']);

        model.set(attribute, [999999.99]);
        deepEqual(attributes[attribute], ['999999.99']);

        model.set(attribute, [0]);
        deepEqual(attributes[attribute], ['0']);

        model.set(attribute, [true]);
        deepEqual(attributes[attribute], ['true']);

        model.set(attribute, [false]);
        deepEqual(attributes[attribute], ['false']);

        model.set(attribute, [date]);
        deepEqual(attributes[attribute], [date.toString()]);

        model.set(attribute, [array]);
        deepEqual(attributes[attribute], ['']);

        model.set(attribute, [object]);
        deepEqual(attributes[attribute], ['[object Object]']);

        model.set(attribute, [null]);
        deepEqual(attributes[attribute], [null]);

        model.set(attribute, [undefined]);
        deepEqual(attributes[attribute], [null]);

        model.set(attribute, []);
        deepEqual(attributes[attribute], []);

        model.set(attribute, null);
        deepEqual(attributes[attribute], []);

        model.set(attribute, undefined);
        deepEqual(attributes[attribute], []);

        model.unset(attribute);
        ok(!_.has(attributes, attribute));
    });

    test('set and unset nested model', function () {
        var attribute = 'nested-model', model = this.model,
            nestedModel = model.get(attribute);

        model.set(attribute, { id: 0, value: 'foo' });
        deepEqual(nestedModel.toJSON(), { id: 0, value: 'foo' });

        model.set(attribute, new Backbone.Model({ id: 0, value: 'foo' }));
        deepEqual(nestedModel.toJSON(), { id: 0, value: 'foo' });

        model.set(attribute, nestedModel);
        deepEqual(nestedModel.toJSON(), { id: 0, value: 'foo' });

        model.set(attribute, {});
        deepEqual(nestedModel.toJSON(), {});

        model.set(attribute, null);
        deepEqual(nestedModel.toJSON(), {});

        model.set(attribute, undefined);
        deepEqual(nestedModel.toJSON(), {});

        model.unset(attribute);
        ok(!_.has(model.attributes, attribute));
    });

    test('set and unset nested collection', function () {
        var attribute = 'nested-collection', model = this.model,
            nestedCollection = model.get(attribute);

        model.set(attribute, [
            { id: 1, value: 'bar' },
            { id: 2, value: 'baz' },
            { id: 3, value: 'qux' }
        ]);

        deepEqual(nestedCollection.toJSON(), [
            { id: 1, value: 'bar' },
            { id: 2, value: 'baz' },
            { id: 3, value: 'qux' }
        ]);


        model.set(attribute, new Backbone.Collection([
            { id: 1, value: 'bar' },
            { id: 2, value: 'baz' },
            { id: 3, value: 'qux' }
        ]));

        deepEqual(nestedCollection.toJSON(), [
            { id: 1, value: 'bar' },
            { id: 2, value: 'baz' },
            { id: 3, value: 'qux' }
        ]);


        model.set(attribute, nestedCollection);
        deepEqual(nestedCollection.toJSON(), [
            { id: 1, value: 'bar' },
            { id: 2, value: 'baz' },
            { id: 3, value: 'qux' }
        ]);

        model.set(attribute, []);
        deepEqual(nestedCollection.toJSON(), []);

        model.set(attribute, null);
        deepEqual(nestedCollection.toJSON(), []);

        model.set(attribute, undefined);
        deepEqual(nestedCollection.toJSON(), []);

        model.unset(attribute);
        ok(!_.has(model.attributes, attribute));
    });

    test('set and unset reference model', function () {
        var attribute = 'reference-model', model = this.model,
            referenceModel = model.get(attribute);

        model.set(attribute, 0);
        deepEqual(referenceModel.toJSON(), { id: 0, value: 'foo' });

        model.set(attribute, new Backbone.Model({ id: 0, value: 'foo' }));
        deepEqual(referenceModel.toJSON(), { id: 0, value: 'foo' });

        model.set(attribute, referenceModel);
        deepEqual(referenceModel.toJSON(), { id: 0, value: 'foo' });

        model.set(attribute, {});
        deepEqual(referenceModel.toJSON(), {});

        model.set(attribute, null);
        deepEqual(referenceModel.toJSON(), {});

        model.set(attribute, undefined);
        deepEqual(referenceModel.toJSON(), {});

        model.unset(attribute);
        ok(!_.has(model.attributes, attribute));
    });

    test('set and unset reference collection', function () {
        var attribute = 'reference-collection', model = this.model,
            referenceCollection = model.get(attribute);

        model.set(attribute, [
            1,
            2,
            3
        ]);

        deepEqual(referenceCollection.toJSON(), [
            { id: 1, value: 'bar' },
            { id: 2, value: 'baz' },
            { id: 3, value: 'qux' }
        ]);


        model.set(attribute, new Backbone.Collection([
            { id: 1, value: 'bar' },
            { id: 2, value: 'baz' },
            { id: 3, value: 'qux' }
        ]));

        deepEqual(referenceCollection.toJSON(), [
            { id: 1, value: 'bar' },
            { id: 2, value: 'baz' },
            { id: 3, value: 'qux' }
        ]);


        model.set(attribute, referenceCollection);
        deepEqual(referenceCollection.toJSON(), [
            { id: 1, value: 'bar' },
            { id: 2, value: 'baz' },
            { id: 3, value: 'qux' }
        ]);

        model.set(attribute, []);
        deepEqual(referenceCollection.toJSON(), []);

        model.set(attribute, null);
        deepEqual(referenceCollection.toJSON(), []);

        model.set(attribute, undefined);
        deepEqual(referenceCollection.toJSON(), []);

        model.unset(attribute);
        ok(!_.has(model.attributes, attribute));
    });

    test('set and unset typeless property', function () {
        var attribute = 'typeless-property', model = this.model, attributes = model.attributes,

            date = new Date('12/12/2012'), array = [], object = {};

        model.set(attribute, 'string');
        strictEqual(attributes[attribute], 'string');

        model.set(attribute, '');
        strictEqual(attributes[attribute], '');

        model.set(attribute, 999999.99);
        strictEqual(attributes[attribute], 999999.99);

        model.set(attribute, 0);
        strictEqual(attributes[attribute], 0);

        model.set(attribute, true);
        strictEqual(attributes[attribute], true);

        model.set(attribute, false);
        strictEqual(attributes[attribute], false);

        model.set(attribute, date);
        strictEqual(attributes[attribute], date);

        model.set(attribute, array);
        strictEqual(attributes[attribute], array);

        model.set(attribute, object);
        strictEqual(attributes[attribute], object);

        model.set(attribute, null);
        strictEqual(attributes[attribute], null);

        model.set(attribute, undefined);
        strictEqual(attributes[attribute], null);

        model.unset(attribute);
        ok(!_.has(attributes, attribute));
    });

    test('set and unset undefined property', function () {
        var attribute = 'undefined-property', model = this.model, attributes = model.attributes,

            date = new Date('12/12/2012'), array = [], object = {};

        model.set(attribute, 'string');
        strictEqual(attributes[attribute], 'string');

        model.set(attribute, '');
        strictEqual(attributes[attribute], '');

        model.set(attribute, 999999.99);
        strictEqual(attributes[attribute], 999999.99);

        model.set(attribute, 0);
        strictEqual(attributes[attribute], 0);

        model.set(attribute, true);
        strictEqual(attributes[attribute], true);

        model.set(attribute, false);
        strictEqual(attributes[attribute], false);

        model.set(attribute, date);
        strictEqual(attributes[attribute], date);

        model.set(attribute, array);
        strictEqual(attributes[attribute], array);

        model.set(attribute, object);
        strictEqual(attributes[attribute], object);

        model.set(attribute, null);
        strictEqual(attributes[attribute], null);

        model.set(attribute, undefined);
        strictEqual(attributes[attribute], undefined);

        model.unset(attribute);
        ok(!_.has(attributes, attribute));
    });
}());

(function (factory) {
    'use strict';

    var isNode = typeof module === 'object' && typeof exports === 'object';

    ////////////////////

    var root = isNode ? require('../environment.js') : window;

    ////////////////////

    factory(root, isNode);

}(function (root) {
    'use strict';

    var _ = root._, Backbone = root.Backbone, Globalize = root.Globalize,

        chai = root.chai,
        sinon = root.sinon;

    ////////////////////

    var expect = chai.expect;

    ////////////////////

    describe('Backbone.Schema', function () {

        ////////////////////

        var model, schema, sourceCollection = new Backbone.Collection();

        ////////////////////

        before(function () {
            Globalize.addCultureInfo('en', {
                messages: {
                    'HELLO_WORLD': 'Hello, World!'
                }
            });
        });

        beforeEach(function () {
            sourceCollection.set([
                { id: 0, value: 'foo' },
                { id: 1, value: 'bar' },
                { id: 2, value: 'baz' },
                { id: 3, value: 'qux' }
            ]);
        });

        // afterEach(function () {
        //
        // });

        // after(function () {
        //
        // });

        ////////////////////

        describe('#constructor(model)', function () {
            it('should initialize the schema', function () {

                ////////////////////

                var Model = Backbone.Model.extend({
                    initialize: function () {
                        schema = Backbone.Schema(this);
                    }
                });

                ////////////////////

                model = new Model({
                    'string-property': 'string',
                    'boolean-property': true,
                    'number-property': 999999.99,
                    'datetime-property': '2012-12-12T00:00:00.000Z',
                    'locale-property': 'HELLO_WORLD',

                    'array-of-strings': ['string'],
                    'array-of-booleans': [true],
                    'array-of-numbers': [999999.99],
                    'array-of-datetimes': ['2012-12-12T00:00:00.000Z'],
                    'array-of-locales': ['HELLO_WORLD'],

                    'nested-model': { id: 0, value: 'foo' },
                    'nested-collection': [
                        { id: 1, value: 'bar' },
                        { id: 2, value: 'baz' },
                        { id: 3, value: 'qux' }
                    ],

                    'reference-model': 0,
                    'reference-collection': [1, 2, 3]
                });

                expect(schema).to.be.an.instanceOf(Backbone.Schema);
            });
        });

        describe('#define(attribute, options)', function () {
            it('should define attributes of the schema', function () {
                schema.define({
                    'string-property': { type: 'string' },
                    'boolean-property': { type: 'boolean' },
                    'number-property': { type: 'number' },
                    'datetime-property': { type: 'datetime', format: 'd', standard: 'iso' },
                    'locale-property': { type: 'locale' }
                });

                schema.define({
                    'array-of-strings': { array: 'string' },
                    'array-of-booleans': { array: 'boolean' },
                    'array-of-numbers': { array: 'number' },
                    'array-of-datetimes': { array: 'datetime', format: 'd', standard: 'iso' },
                    'array-of-locales': { array: 'locale' }
                });

                schema.define({
                    'nested-model': { model: Backbone.Model, clear: true },
                    'nested-collection': { collection: Backbone.Collection }
                });

                schema.define({
                    'reference-model': { type: 'model', source: sourceCollection, clear: true },
                    'reference-collection': { type: 'collection', source: sourceCollection }
                });

                schema.define('typeless-property');

                expect(schema.attributes).to.have.keys([
                    'string-property',
                    'boolean-property',
                    'number-property',
                    'datetime-property',
                    'locale-property',

                    'array-of-strings',
                    'array-of-booleans',
                    'array-of-numbers',
                    'array-of-datetimes',
                    'array-of-locales',

                    'nested-model',
                    'nested-collection',

                    'reference-model',
                    'reference-collection',

                    'typeless-property'
                ]);
            });

            it('should convert existing attributes of the model according to schema', function () {
                expect(model.attributes['string-property']).to.equal('string');
                expect(model.attributes['boolean-property']).to.equal(true);
                expect(model.attributes['number-property']).to.equal(999999.99);
                expect(model.attributes['datetime-property']).to.equal('2012-12-12T00:00:00.000Z');
                expect(model.attributes['locale-property']).to.equal('HELLO_WORLD');

                expect(model.attributes['array-of-strings']).to.deep.equal(['string']);
                expect(model.attributes['array-of-booleans']).to.deep.equal([true]);
                expect(model.attributes['array-of-numbers']).to.deep.equal([999999.99]);
                expect(model.attributes['array-of-datetimes']).to.deep.equal(['2012-12-12T00:00:00.000Z']);
                expect(model.attributes['array-of-locales']).to.deep.equal(['HELLO_WORLD']);

                expect(model.attributes['nested-model'].toJSON()).to.deep.equal({ id: 0, value: 'foo' });
                expect(model.attributes['nested-collection'].toJSON()).to.deep.equal([
                    { id: 1, value: 'bar' },
                    { id: 2, value: 'baz' },
                    { id: 3, value: 'qux' }
                ]);

                expect(model.attributes['reference-model'].toJSON()).to.deep.equal({ id: 0, value: 'foo' });
                expect(model.attributes['reference-collection'].toJSON()).to.deep.equal([
                    { id: 1, value: 'bar' },
                    { id: 2, value: 'baz' },
                    { id: 3, value: 'qux' }
                ]);

                expect(model.attributes['typeless-property']).to.be.null;
            });
        });

        describe('#model.toJSON()', function () {
            it('should return original attributes of the model and invoke `toJSON()` of all nested models and collections', function () {
                expect(model.toJSON()).to.deep.equal({
                    'string-property': 'string',
                    'boolean-property': true,
                    'number-property': 999999.99,
                    'datetime-property': '2012-12-12T00:00:00.000Z',
                    'locale-property': 'HELLO_WORLD',

                    'array-of-strings': ['string'],
                    'array-of-booleans': [true],
                    'array-of-numbers': [999999.99],
                    'array-of-datetimes': ['2012-12-12T00:00:00.000Z'],
                    'array-of-locales': ['HELLO_WORLD'],

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
        });

        describe('#model.get("string-property")', function () {
            it('should return value as is', function () {
                var stringProperty = model.get('string-property');

                expect(stringProperty).to.equal('string');
            });
        });

        describe('#model.get("boolean-property")', function () {
            it('should return value as is', function () {
                var booleanProperty = model.get('boolean-property');

                expect(booleanProperty).to.equal(true);
            });
        });

        describe('#model.get("number-property")', function () {
            it('should return value as is', function () {
                var numberProperty = model.get('number-property');

                expect(numberProperty).to.equal(999999.99);
            });
        });

        describe('#model.get("datetime-property")', function () {
            it('should return value as is', function () {
                var datetimeProperty = model.get('datetime-property');

                expect(datetimeProperty).to.equal('12/12/2012');
            });
        });

        describe('#model.get("locale-property")', function () {
            it('should return string of localization', function () {
                var localeProperty = model.get('locale-property');

                expect(localeProperty).to.equal('Hello, World!');
            });
        });

        describe('#model.get("array-of-strings")', function () {
            it('should return all values from array as is', function () {
                var arrayOfStrings = model.get('array-of-strings');

                expect(arrayOfStrings).to.deep.equal(['string']);
            });
        });

        describe('#model.get("array-of-booleans")', function () {
            it('should return all values from array as is', function () {
                var arrayOfBooleans = model.get('array-of-booleans');

                expect(arrayOfBooleans).to.deep.equal([true]);
            });
        });

        describe('#model.get("array-of-numbers")', function () {
            it('should return all values from array as is', function () {
                var arrayOfNumbers = model.get('array-of-numbers');

                expect(arrayOfNumbers).to.deep.equal([999999.99]);
            });
        });

        describe('#model.get("array-of-datetimes")', function () {
            it('should return all values from array as is', function () {
                var arrayOfDatetimes = model.get('array-of-datetimes');

                expect(arrayOfDatetimes).to.deep.equal(['12/12/2012']);
            });
        });

        describe('#model.get("array-of-locales")', function () {
            it('should return all values from array as strings of localization', function () {
                var arrayOfLocales = model.get('array-of-locales');

                expect(arrayOfLocales).to.deep.equal(['Hello, World!']);
            });
        });

        describe('#model.get("nested-model")', function () {
            it('should return value as is', function () {
                var nestedModel = model.get('nested-model');

                expect(nestedModel.toJSON()).to.deep.equal({ id: 0, value: 'foo' });
            });
        });

        describe('#model.get("nested-collection")', function () {
            it('should return value as is', function () {
                var nestedCollection = model.get('nested-collection');

                expect(nestedCollection.toJSON()).to.deep.equal([
                    { id: 1, value: 'bar' },
                    { id: 2, value: 'baz' },
                    { id: 3, value: 'qux' }
                ]);
            });
        });

        describe('#model.get("reference-model")', function () {
            it('should return value as is', function () {
                var referenceModel = model.get('reference-model');

                expect(referenceModel).to.equal(sourceCollection.get(0));
            });
        });

        describe('#model.get("reference-collection")', function () {
            it('should return value as is', function () {
                var referenceCollection = model.get('reference-collection');

                expect(referenceCollection.models).to.deep.equal([
                    sourceCollection.get(1),
                    sourceCollection.get(2),
                    sourceCollection.get(3)
                ]);
            });
        });

        describe('#model.get("typeless-property")', function () {
            it('should return value as is', function () {
                var typelessProperty = model.get('typeless-property');

                expect(typelessProperty).to.be.null;
            });
        });

        describe('#model.get("undefined-property")', function () {
            it('should return value as is', function () {
                var undefinedProperty = model.get('undefined-property');

                expect(undefinedProperty).to.be.undefined;
            });
        });

        describe('#model.set("string-property")', function () {
            it('should convert value to string', function () {
                var attribute = 'string-property', date = new Date('12/12/2012'), array = [], object = {};

                model.set(attribute, 'string');
                expect(model.attributes[attribute]).to.equal('string');

                model.set(attribute, '');
                expect(model.attributes[attribute]).to.equal('');

                model.set(attribute, 999999.99);
                expect(model.attributes[attribute]).to.equal('999999.99');

                model.set(attribute, 0);
                expect(model.attributes[attribute]).to.equal('0');

                model.set(attribute, true);
                expect(model.attributes[attribute]).to.equal('true');

                model.set(attribute, false);
                expect(model.attributes[attribute]).to.equal('false');

                model.set(attribute, date);
                expect(model.attributes[attribute]).to.equal(date.toString());

                model.set(attribute, array);
                expect(model.attributes[attribute]).to.equal('');

                model.set(attribute, object);
                expect(model.attributes[attribute]).to.equal('[object Object]');

                model.set(attribute, null);
                expect(model.attributes[attribute]).to.be.null;

                model.set(attribute, undefined);
                expect(model.attributes[attribute]).to.be.null;

                model.unset(attribute);
                expect(model.attributes).to.not.have.property(attribute);
            });
        });

        describe('#model.set("boolean-property")', function () {
            it('should convert value to boolean', function () {
                var attribute = 'boolean-property', date = new Date('12/12/2012'), array = [], object = {};

                model.set(attribute, 'true');
                expect(model.attributes[attribute]).to.be.true;

                model.set(attribute, '');
                expect(model.attributes[attribute]).to.equal(false);

                model.set(attribute, 999999.99);
                expect(model.attributes[attribute]).to.equal(true);

                model.set(attribute, 0);
                expect(model.attributes[attribute]).to.equal(false);

                model.set(attribute, true);
                expect(model.attributes[attribute]).to.equal(true);

                model.set(attribute, false);
                expect(model.attributes[attribute]).to.equal(false);

                model.set(attribute, date);
                expect(model.attributes[attribute]).to.equal(true);

                model.set(attribute, array);
                expect(model.attributes[attribute]).to.equal(true);

                model.set(attribute, object);
                expect(model.attributes[attribute]).to.equal(true);

                model.set(attribute, null);
                expect(model.attributes[attribute]).to.be.null;

                model.set(attribute, undefined);
                expect(model.attributes[attribute]).to.be.null;

                model.unset(attribute);
                expect(model.attributes).to.not.have.property(attribute);
            });
        });

        describe('#model.set("number-property")', function () {
            it('should convert value to number', function () {
                var attribute = 'number-property', date = new Date('12/12/2012'), array = [], object = {};

                model.set(attribute, '999,999.99');
                expect(model.attributes[attribute]).to.equal(999999.99);

                model.set(attribute, '');
                expect(model.attributes[attribute]).to.equal(0);

                model.set(attribute, 999999.99);
                expect(model.attributes[attribute]).to.equal(999999.99);

                model.set(attribute, 0);
                expect(model.attributes[attribute]).to.equal(0);

                model.set(attribute, true);
                expect(model.attributes[attribute]).to.equal(1);

                model.set(attribute, false);
                expect(model.attributes[attribute]).to.equal(0);

                model.set(attribute, date);
                expect(model.attributes[attribute]).to.equal(date.getTime());

                model.set(attribute, array);
                expect(model.attributes[attribute]).to.equal(0);

                model.set(attribute, object);
                expect(isNaN(model.attributes[attribute])).to.be.true;

                model.set(attribute, null);
                expect(model.attributes[attribute]).to.be.null;

                model.set(attribute, undefined);
                expect(model.attributes[attribute]).to.be.null;

                model.unset(attribute);
                expect(model.attributes).to.not.have.property(attribute);
            });
        });

        describe('#model.set("datetime-property")', function () {
            it('should convert value to instance of date', function () {
                var attribute = 'datetime-property', date = new Date('12/12/2012'), array = [], object = {};

                model.set(attribute, '12/12/2012');
                expect(model.attributes[attribute]).to.equal(date.toISOString());

                model.set(attribute, '');
                expect(model.attributes[attribute]).to.equal('Invalid Date');

                model.set(attribute, 999999.99);
                expect(model.attributes[attribute]).to.equal('1970-01-01T00:16:39.999Z');

                model.set(attribute, 0);
                expect(model.attributes[attribute]).to.equal('1970-01-01T00:00:00.000Z');

                model.set(attribute, true);
                expect(model.attributes[attribute]).to.equal('1970-01-01T00:00:00.001Z');

                model.set(attribute, false);
                expect(model.attributes[attribute]).to.equal('1970-01-01T00:00:00.000Z');

                model.set(attribute, date);
                expect(model.attributes[attribute]).to.equal(date.toISOString());

                model.set(attribute, array);
                expect(model.attributes[attribute]).to.equal('Invalid Date');

                model.set(attribute, object);
                expect(model.attributes[attribute]).to.equal('Invalid Date');

                model.set(attribute, null);
                expect(model.attributes[attribute]).to.be.null;

                model.set(attribute, undefined);
                expect(model.attributes[attribute]).to.be.null;

                model.unset(attribute);
                expect(model.attributes).to.not.have.property(attribute);
            });
        });

        describe('#model.set("locale-property")', function () {
            it('should convert value to key of localization', function () {
                var attribute = 'locale-property', date = new Date('12/12/2012'), array = [], object = {};

                model.set(attribute, 'Hello, World!');
                expect(model.attributes[attribute]).to.equal('HELLO_WORLD');

                model.set(attribute, '');
                expect(model.attributes[attribute]).to.equal('');

                model.set(attribute, 999999.99);
                expect(model.attributes[attribute]).to.equal('999999.99');

                model.set(attribute, 0);
                expect(model.attributes[attribute]).to.equal('0');

                model.set(attribute, true);
                expect(model.attributes[attribute]).to.equal('true');

                model.set(attribute, false);
                expect(model.attributes[attribute]).to.equal('false');

                model.set(attribute, date);
                expect(model.attributes[attribute]).to.equal(date.toString());

                model.set(attribute, array);
                expect(model.attributes[attribute]).to.equal('');

                model.set(attribute, object);
                expect(model.attributes[attribute]).to.equal('[object Object]');

                model.set(attribute, null);
                expect(model.attributes[attribute]).to.be.null;

                model.set(attribute, undefined);
                expect(model.attributes[attribute]).to.be.null;

                model.unset(attribute);
                expect(model.attributes).to.not.have.property(attribute);
            });
        });

        describe('#model.set("array-of-strings")', function () {
            it('should convert each value in array to string', function () {
                var attribute = 'array-of-strings', date = new Date('12/12/2012'), array = [], object = {};

                model.set(attribute, ['string']);
                expect(model.attributes[attribute]).to.deep.equal(['string']);

                model.set(attribute, ['']);
                expect(model.attributes[attribute]).to.deep.equal(['']);

                model.set(attribute, [999999.99]);
                expect(model.attributes[attribute]).to.deep.equal(['999999.99']);

                model.set(attribute, [0]);
                expect(model.attributes[attribute]).to.deep.equal(['0']);

                model.set(attribute, [true]);
                expect(model.attributes[attribute]).to.deep.equal(['true']);

                model.set(attribute, [false]);
                expect(model.attributes[attribute]).to.deep.equal(['false']);

                model.set(attribute, [date]);
                expect(model.attributes[attribute]).to.deep.equal([date.toString()]);

                model.set(attribute, [array]);
                expect(model.attributes[attribute]).to.deep.equal(['']);

                model.set(attribute, [object]);
                expect(model.attributes[attribute]).to.deep.equal(['[object Object]']);

                model.set(attribute, [null]);
                expect(model.attributes[attribute]).to.deep.equal([null]);

                model.set(attribute, [undefined]);
                expect(model.attributes[attribute]).to.deep.equal([null]);

                model.set(attribute, []);
                expect(model.attributes[attribute]).to.deep.equal([]);

                model.set(attribute, null);
                expect(model.attributes[attribute]).to.deep.equal([]);

                model.set(attribute, undefined);
                expect(model.attributes[attribute]).to.deep.equal([]);

                model.unset(attribute);
                expect(model.attributes).to.not.have.property(attribute);
            });
        });

        describe('#model.set("array-of-booleans")', function () {
            it('should convert each value in array to boolean', function () {
                var attribute = 'array-of-booleans', date = new Date('12/12/2012'), array = [], object = {};

                model.set(attribute, ['true']);
                expect(model.attributes[attribute]).to.deep.equal([true]);

                model.set(attribute, ['']);
                expect(model.attributes[attribute]).to.deep.equal([false]);

                model.set(attribute, [999999.99]);
                expect(model.attributes[attribute]).to.deep.equal([true]);

                model.set(attribute, [0]);
                expect(model.attributes[attribute]).to.deep.equal([false]);

                model.set(attribute, [true]);
                expect(model.attributes[attribute]).to.deep.equal([true]);

                model.set(attribute, [false]);
                expect(model.attributes[attribute]).to.deep.equal([false]);

                model.set(attribute, [date]);
                expect(model.attributes[attribute]).to.deep.equal([true]);

                model.set(attribute, [array]);
                expect(model.attributes[attribute]).to.deep.equal([true]);

                model.set(attribute, [object]);
                expect(model.attributes[attribute]).to.deep.equal([true]);

                model.set(attribute, [null]);
                expect(model.attributes[attribute]).to.deep.equal([null]);

                model.set(attribute, [undefined]);
                expect(model.attributes[attribute]).to.deep.equal([null]);

                model.set(attribute, []);
                expect(model.attributes[attribute]).to.deep.equal([]);

                model.set(attribute, null);
                expect(model.attributes[attribute]).to.deep.equal([]);

                model.set(attribute, undefined);
                expect(model.attributes[attribute]).to.deep.equal([]);

                model.unset(attribute);
                expect(model.attributes).to.not.have.property(attribute);
            });
        });

        describe('#model.set("array-of-numbers")', function () {
            it('should convert each value in array to number', function () {
                var attribute = 'array-of-numbers', date = new Date('12/12/2012'), array = [], object = {};

                model.set(attribute, ['999,999.99']);
                expect(model.attributes[attribute]).to.deep.equal([999999.99]);

                model.set(attribute, ['']);
                expect(model.attributes[attribute]).to.deep.equal([0]);

                model.set(attribute, [999999.99]);
                expect(model.attributes[attribute]).to.deep.equal([999999.99]);

                model.set(attribute, [0]);
                expect(model.attributes[attribute]).to.deep.equal([0]);

                model.set(attribute, [true]);
                expect(model.attributes[attribute]).to.deep.equal([1]);

                model.set(attribute, [false]);
                expect(model.attributes[attribute]).to.deep.equal([0]);

                model.set(attribute, [date]);
                expect(model.attributes[attribute]).to.deep.equal([date.getTime()]);

                model.set(attribute, [array]);
                expect(model.attributes[attribute]).to.deep.equal([0]);

                model.set(attribute, [object]);
                expect(model.attributes[attribute]).to.deep.equal(['NaN']);

                model.set(attribute, [null]);
                expect(model.attributes[attribute]).to.deep.equal([null]);

                model.set(attribute, [undefined]);
                expect(model.attributes[attribute]).to.deep.equal([null]);

                model.set(attribute, []);
                expect(model.attributes[attribute]).to.deep.equal([]);

                model.set(attribute, null);
                expect(model.attributes[attribute]).to.deep.equal([]);

                model.set(attribute, undefined);
                expect(model.attributes[attribute]).to.deep.equal([]);

                model.unset(attribute);
                expect(model.attributes).to.not.have.property(attribute);
            });
        });

        describe('#model.set("array-of-datetimes")', function () {
            it('should convert each value in array to instance of date', function () {
                var attribute = 'array-of-datetimes', date = new Date('12/12/2012'), array = [], object = {};

                model.set(attribute, ['12/12/2012']);
                expect(model.attributes[attribute]).to.deep.equal([date.toISOString()]);

                model.set(attribute, ['']);
                expect(model.attributes[attribute]).to.deep.equal(['Invalid Date']);

                model.set(attribute, [999999.99]);
                expect(model.attributes[attribute]).to.deep.equal(['1970-01-01T00:16:39.999Z']);

                model.set(attribute, [0]);
                expect(model.attributes[attribute]).to.deep.equal(['1970-01-01T00:00:00.000Z']);

                model.set(attribute, [true]);
                expect(model.attributes[attribute]).to.deep.equal(['1970-01-01T00:00:00.001Z']);

                model.set(attribute, [false]);
                expect(model.attributes[attribute]).to.deep.equal(['1970-01-01T00:00:00.000Z']);

                model.set(attribute, [date]);
                expect(model.attributes[attribute]).to.deep.equal([date.toISOString()]);

                model.set(attribute, [array]);
                expect(model.attributes[attribute]).to.deep.equal(['Invalid Date']);

                model.set(attribute, [object]);
                expect(model.attributes[attribute]).to.deep.equal(['Invalid Date']);

                model.set(attribute, [null]);
                expect(model.attributes[attribute]).to.deep.equal([null]);

                model.set(attribute, [undefined]);
                expect(model.attributes[attribute]).to.deep.equal([null]);

                model.set(attribute, []);
                expect(model.attributes[attribute]).to.deep.equal([]);

                model.set(attribute, null);
                expect(model.attributes[attribute]).to.deep.equal([]);

                model.set(attribute, undefined);
                expect(model.attributes[attribute]).to.deep.equal([]);

                model.unset(attribute);
                expect(model.attributes).to.not.have.property(attribute);
            });
        });

        describe('#model.set("array-of-locales")', function () {
            it('should convert each value in array to key of localization', function () {
                var attribute = 'array-of-locales', date = new Date('12/12/2012'), array = [], object = {};

                model.set(attribute, ['Hello, World!']);
                expect(model.attributes[attribute]).to.deep.equal(['HELLO_WORLD']);

                model.set(attribute, ['']);
                expect(model.attributes[attribute]).to.deep.equal(['']);

                model.set(attribute, [999999.99]);
                expect(model.attributes[attribute]).to.deep.equal(['999999.99']);

                model.set(attribute, [0]);
                expect(model.attributes[attribute]).to.deep.equal(['0']);

                model.set(attribute, [true]);
                expect(model.attributes[attribute]).to.deep.equal(['true']);

                model.set(attribute, [false]);
                expect(model.attributes[attribute]).to.deep.equal(['false']);

                model.set(attribute, [date]);
                expect(model.attributes[attribute]).to.deep.equal([date.toString()]);

                model.set(attribute, [array]);
                expect(model.attributes[attribute]).to.deep.equal(['']);

                model.set(attribute, [object]);
                expect(model.attributes[attribute]).to.deep.equal(['[object Object]']);

                model.set(attribute, [null]);
                expect(model.attributes[attribute]).to.deep.equal([null]);

                model.set(attribute, [undefined]);
                expect(model.attributes[attribute]).to.deep.equal([null]);

                model.set(attribute, []);
                expect(model.attributes[attribute]).to.deep.equal([]);

                model.set(attribute, null);
                expect(model.attributes[attribute]).to.deep.equal([]);

                model.set(attribute, undefined);
                expect(model.attributes[attribute]).to.deep.equal([]);

                model.unset(attribute);
                expect(model.attributes).to.not.have.property(attribute);
            });
        });

        describe('#model.set("nested-model")', function () {
            it('should initialize model using value as data set (argument `attributes`)', function () {
                var attribute = 'nested-model', nestedModel = model.get(attribute);

                model.set(attribute, { id: 0, value: 'foo' });
                expect(nestedModel.toJSON()).to.deep.equal({ id: 0, value: 'foo' });

                model.set(attribute, new Backbone.Model({ id: 0, value: 'foo' }));
                expect(nestedModel.toJSON()).to.deep.equal({ id: 0, value: 'foo' });

                model.set(attribute, nestedModel);
                expect(nestedModel.toJSON()).to.deep.equal({ id: 0, value: 'foo' });

                model.set(attribute, {});
                expect(nestedModel.toJSON()).to.deep.equal({});

                model.set(attribute, null);
                expect(nestedModel.toJSON()).to.deep.equal({});

                model.set(attribute, undefined);
                expect(nestedModel.toJSON()).to.deep.equal({});

                model.unset(attribute);
                expect(model.attributes).to.not.have.property(attribute);
            });
        });

        describe('#model.set("nested-collection")', function () {
            it('should initialize collection using value as data set (argument `models`)', function () {
                var attribute = 'nested-collection', nestedCollection = model.get(attribute);

                model.set(attribute, [
                    { id: 1, value: 'bar' },
                    { id: 2, value: 'baz' },
                    { id: 3, value: 'qux' }
                ]);

                expect(nestedCollection.toJSON()).to.deep.equal([
                    { id: 1, value: 'bar' },
                    { id: 2, value: 'baz' },
                    { id: 3, value: 'qux' }
                ]);

                model.set(attribute, new Backbone.Collection([
                    { id: 1, value: 'bar' },
                    { id: 2, value: 'baz' },
                    { id: 3, value: 'qux' }
                ]));

                expect(nestedCollection.toJSON()).to.deep.equal([
                    { id: 1, value: 'bar' },
                    { id: 2, value: 'baz' },
                    { id: 3, value: 'qux' }
                ]);

                model.set(attribute, nestedCollection);
                expect(nestedCollection.toJSON()).to.deep.equal([
                    { id: 1, value: 'bar' },
                    { id: 2, value: 'baz' },
                    { id: 3, value: 'qux' }
                ]);

                model.set(attribute, []);
                expect(nestedCollection.toJSON()).to.deep.equal([]);

                model.set(attribute, null);
                expect(nestedCollection.toJSON()).to.deep.equal([]);

                model.set(attribute, undefined);
                expect(nestedCollection.toJSON()).to.deep.equal([]);

                model.unset(attribute);
                expect(model.attributes).to.not.have.property(attribute);
            });
        });

        describe('#model.set("reference-model")', function () {
            it('should set reference model (pick it from source collection) using value as ID', function () {
                var attribute = 'reference-model', referenceModel = model.get(attribute);

                model.set(attribute, 0);
                expect(referenceModel.toJSON()).to.deep.equal({ id: 0, value: 'foo' });

                model.set(attribute, new Backbone.Model({ id: 0, value: 'foo' }));
                expect(referenceModel.toJSON()).to.deep.equal({ id: 0, value: 'foo' });

                model.set(attribute, referenceModel);
                expect(referenceModel.toJSON()).to.deep.equal({ id: 0, value: 'foo' });

                model.set(attribute, {});
                expect(referenceModel.toJSON()).to.deep.equal({});

                model.set(attribute, null);
                expect(referenceModel.toJSON()).to.deep.equal({});

                model.set(attribute, undefined);
                expect(referenceModel.toJSON()).to.deep.equal({});

                model.unset(attribute);
                expect(model.attributes).to.not.have.property(attribute);
            });
        });

        describe('#model.set("reference-collection")', function () {
            it('should initialize collection with reference models (pick them from source collection) using value as a set of IDs', function () {
                var attribute = 'reference-collection', referenceCollection = model.get(attribute);

                model.set(attribute, [
                    1,
                    2,
                    3
                ]);

                expect(referenceCollection.toJSON()).to.deep.equal([
                    { id: 1, value: 'bar' },
                    { id: 2, value: 'baz' },
                    { id: 3, value: 'qux' }
                ]);

                model.set(attribute, new Backbone.Collection([
                    { id: 1, value: 'bar' },
                    { id: 2, value: 'baz' },
                    { id: 3, value: 'qux' }
                ]));

                expect(referenceCollection.toJSON()).to.deep.equal([
                    { id: 1, value: 'bar' },
                    { id: 2, value: 'baz' },
                    { id: 3, value: 'qux' }
                ]);

                model.set(attribute, referenceCollection);
                expect(referenceCollection.toJSON()).to.deep.equal([
                    { id: 1, value: 'bar' },
                    { id: 2, value: 'baz' },
                    { id: 3, value: 'qux' }
                ]);

                model.set(attribute, []);
                expect(referenceCollection.toJSON()).to.deep.equal([]);

                model.set(attribute, null);
                expect(referenceCollection.toJSON()).to.deep.equal([]);

                model.set(attribute, undefined);
                expect(referenceCollection.toJSON()).to.deep.equal([]);

                model.unset(attribute);
                expect(model.attributes).to.not.have.property(attribute);
            });
        });

        describe('#model.set("typeless-property")', function () {
            it('should not convert value if it is not undefined', function () {
                var attribute = 'typeless-property', date = new Date('12/12/2012'), array = [], object = {};

                model.set(attribute, 'string');
                expect(model.attributes[attribute]).to.equal('string');

                model.set(attribute, '');
                expect(model.attributes[attribute]).to.equal('');

                model.set(attribute, 999999.99);
                expect(model.attributes[attribute]).to.equal(999999.99);

                model.set(attribute, 0);
                expect(model.attributes[attribute]).to.equal(0);

                model.set(attribute, true);
                expect(model.attributes[attribute]).to.equal(true);

                model.set(attribute, false);
                expect(model.attributes[attribute]).to.equal(false);

                model.set(attribute, date);
                expect(model.attributes[attribute]).to.equal(date);

                model.set(attribute, array);
                expect(model.attributes[attribute]).to.equal(array);

                model.set(attribute, object);
                expect(model.attributes[attribute]).to.equal(object);

                model.set(attribute, null);
                expect(model.attributes[attribute]).to.be.null;

                model.set(attribute, undefined);
                expect(model.attributes[attribute]).to.be.null;

                model.unset(attribute);
                expect(model.attributes).to.not.have.property(attribute);
            });
        });

        describe('#model.set("undefined-property")', function () {
            it('should not convert value in any case', function () {
                var attribute = 'undefined-property', date = new Date('12/12/2012'), array = [], object = {};

                model.set(attribute, 'string');
                expect(model.attributes[attribute]).to.equal('string');

                model.set(attribute, '');
                expect(model.attributes[attribute]).to.equal('');

                model.set(attribute, 999999.99);
                expect(model.attributes[attribute]).to.equal(999999.99);

                model.set(attribute, 0);
                expect(model.attributes[attribute]).to.equal(0);

                model.set(attribute, true);
                expect(model.attributes[attribute]).to.equal(true);

                model.set(attribute, false);
                expect(model.attributes[attribute]).to.equal(false);

                model.set(attribute, date);
                expect(model.attributes[attribute]).to.equal(date);

                model.set(attribute, array);
                expect(model.attributes[attribute]).to.equal(array);

                model.set(attribute, object);
                expect(model.attributes[attribute]).to.equal(object);

                model.set(attribute, null);
                expect(model.attributes[attribute]).to.be.null;

                model.set(attribute, undefined);
                expect(model.attributes[attribute]).to.be.undefined;

                model.unset(attribute);
                expect(model.attributes).to.not.have.property(attribute);
            });
        });
    });
}));

module.exports = (function () {
    'use strict';

    var _ = require('underscore'),
        Backbone = require('backbone'),
        Globalize = require('globalize'),

        chai = require('chai').use(require('sinon-chai')),
        sinon = require('sinon');

    ////////////////////

    Backbone.$ = require('../lib/jquery/jquery.js')(require('./window.js'));

    ////////////////////

    var index = require('../index.js');

    return {
        _: _,
        Backbone: Backbone,
        Globalize: Globalize,

        chai: chai,
        sinon: sinon
    };
}());

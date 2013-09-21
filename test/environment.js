module.exports = (function () {
    'use strict';

    var _ = require('underscore'),
        Backbone = require('backbone'),
        Globalize = require('globalize'),

        chai = require('chai').use(require('sinon-chai')),
        sinon = require('sinon');

    ////////////////////

    global.window = require('./window.js');

    _.extend(Backbone, require('../index.js'), {
        $: require('../lib/jquery/jquery.js')(window)
    });

    ////////////////////

    return {
        _: _,
        Backbone: Backbone,
        Globalize: Globalize,

        chai: chai,
        sinon: sinon
    };
}());

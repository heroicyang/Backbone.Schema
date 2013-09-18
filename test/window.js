(function () {
    'use strict';

    var FIXTURE_FILEPATH = 'test/index.html';

    ////////////////////

    if (typeof exports !== 'undefined') {

        ////////////////////

        var jsdom = require('jsdom'), html = require('fs').readFileSync(FIXTURE_FILEPATH);

        ////////////////////

        module.exports = jsdom.jsdom(html).parentWindow;
    } else {
        $(window.__html__[FIXTURE_FILEPATH]).children().appendTo(document.body);
    }
}());

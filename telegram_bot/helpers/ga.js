console.logger('Init: GA');

// https://www.npmjs.com/package/universal-analytics
var ua = require('universal-analytics'),
    gaId = '';

module.exports = {
    ua: ua,
    gaId: gaId
};
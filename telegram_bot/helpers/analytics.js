console.logger('Init: Analytics');

var config = require('../config');
var ga = require('./ga');

var sendPageView = function(userid, pagename, label){
    var visitor = ga.ua(ga.gaId, userid, {strictCidFormat: false});

    visitor.pageview({
        dp: '/' + config.platform + '/' + pagename,
        dt: label,
        dh: config.hostname
    }, function(err){
        if (err) console.logger(err);
    });
};

module.exports = {
    sendPageView: sendPageView
};
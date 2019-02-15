if (console.logger) console.logger('Init: Scheduler');

module.exports = Scheduler = (function () {
    var events = [], now;
    var interval = 1000;
    setInterval(function () {
        now = (new Date).getTime();
        var lastIndex = -1;

        for (var i = 0; i < events.length; i++) {
            if (events[i].timestamp > now) {
                break;
            }
            events[i].event();
            lastIndex = i;
        }
        events.splice(0, lastIndex + 1);
    }, interval);


    var addEvent = function (params) {
        var ev = {timestamp: params.time || (new Date()).getTime() + params.delay * 1000, event: params.event, uid: params.uid || null};
        var inserted = false;
        if (events.length === 0) events.push(ev);
        else {
            var leftEnd = 0, rightEnd = events.length;
            while (!inserted) {
                var candidate = events[Math.floor((rightEnd + leftEnd) / 2)];
                if (candidate && ev.timestamp === candidate.timestamp) {
                    leftEnd = 0;
                    rightEnd = events.length;
                    ev.timestamp++;
                } else if (rightEnd === leftEnd) {
                    events.splice(leftEnd, 0, ev);
                    inserted = true;
                } else {
                    if (candidate.timestamp < ev.timestamp) {
                        leftEnd = Math.floor((rightEnd + leftEnd) / 2) + 1;
                    } else if (candidate.timestamp > ev.timestamp) {
                        rightEnd = Math.floor((rightEnd + leftEnd) / 2);
                    }
                }
            }
        }
    };

    return {
        add: function (params) {
            if (params.time !== null) addEvent(params);
            else params.event();
        },
        removeByTimestamp: function (time) {
            var index = -1;
            for (var i = 0; i < events.length; i++) {
                if (events[i].timestamp === time) {
                    index = i;
                    break;
                }
            }
            if (index !== -1) events.splice(index, 1);
        },
        removeById: function(uid){
            events = events.filter(function(ev){
                return ev.uid !== uid;
            });
        }
    }
})();
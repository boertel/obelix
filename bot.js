var RtmClient = require('@slack/client').RtmClient,
    RTM_EVENTS = require('@slack/client').RTM_EVENTS,
    RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM,
    _ = require('lodash'),
    http = require('http'),
    foods = require('./foods');


function findFoodDay() {
    var now = new Date(),
        day = now.getDate(),
        month = now.getMonth() + 1;

    day = day < 10 ? '0' + day : day;
    month = month < 10 ? '0' + month : month;

    var key = month + '-' + day;
    return foods[key];
}

function createMessage(foodsList) {
    var foodsOfDay = foodsList.map(function(food) {
        return '*' + food + '*'
    })
    var message = 'Today is National ' + commasAnd(foodsOfDay) + ' Day. Bon appétit!';
    return message;
}

function commasAnd(a) {
    return [a.slice(0, -1).join(', '), a.slice(-1)[0]].join(a.length < 2 ? '' : ' and ');
}


// create a bot
var toChannel = process.env.SLACK_TO_CHANNEL || 'general',
    mute = process.env.BOT_MUTE || false;

var rtm = new RtmClient(process.env.SLACK_TOKEN, { logLevel: '' });
rtm.start();

var store = {
    channels: {},
    users: {}
};


rtm.on(RTM_CLIENT_EVENTS.AUTHENTICATED, function (payload) {
    store = {
        channels: payload.channels,
        users: payload.users
    }
});


rtm.on(RTM_CLIENT_EVENTS.RTM_CONNECTION_OPENED, function () {
    var foodsOfDay = findFoodDay();
    if (foodsOfDay  !== undefined) {
        var message = createMessage(foodsOfDay);
        var to = _.find(store.channels, { name: toChannel });
        if (!mute) {
            //rtm.sendMessage(message, to.id)
        }
    }
});

// To keep Heroku's free dyno awake
http.createServer(function(request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('Ok, dyno is awake.');
}).listen(process.env.PORT || 5000);

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
var toChannel = process.env.SLACK_TO_CHANNEL || 'random',
    mute = process.env.BOT_MUTE === 'true' || false;

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
    var to = _.find(store.channels, { name: toChannel });

    if (foodsOfDay !== undefined && !mute) {
        var message = createMessage(foodsOfDay);
        console.log('sending message...');
        rtm.sendMessage(message, to.id, function() {
            console.log('message sent');
            rtm.disconnect();
        })
    } else {
        console.log('no message to sent');
    }
});

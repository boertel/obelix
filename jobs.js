var RtmClient = require('@slack/client').RtmClient,
    RTM_EVENTS = require('@slack/client').RTM_EVENTS,
    RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM,
    _ = require('lodash');

var day = require('./day'),
    truck = require('./truck');

// create a bot
var toChannel = process.env.SLACK_TO_CHANNEL || 'random',
    mute = process.env.BOT_MUTE === 'true' || false;

var rtm = new RtmClient(process.env.SLACK_TOKEN, { logLevel: '' });
//rtm.start();

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


function getMessages() {
    return new Promise(function(resolve) {
       var dayMessage = day.getMessage();

        truck.getMessage(function(truckMessage) {
            var messages = [];
            dayMessage && messages.push(dayMessage);
            truckMessage && messages.push(truckMessage);
            resolve(messages);
        });
    });
}


rtm.on(RTM_CLIENT_EVENTS.RTM_CONNECTION_OPENED, function () {
    getMessages().then(function(messages) {
        if (messages.length && !mute) {
            console.log('sending message...');
            var to = _.find(store.channels, { name: toChannel });
            var sent = 0;
            messages.map(function(message) {
                rtm.sendMessage(message, to.id, function() {
                    console.log('message sent');
                    sent += 1;
                    if (sent === message.length) {
                        rtm.disconnect();
                    }
                });
            });
        } else {
            console.log('no message to sent');
        }
    }
});

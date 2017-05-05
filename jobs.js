var RtmClient = require('@slack/client').RtmClient,
    RTM_EVENTS = require('@slack/client').RTM_EVENTS,
    RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM,
    MemoryDataStore = require('@slack/client').MemoryDataStore,
    WebClient = require('@slack/client').WebClient,
    _ = require('lodash');

var day = require('./day'),
    truck = require('./truck');

// create a bot
var toChannel = process.env.SLACK_TO_CHANNEL || 'random',
    mute = process.env.BOT_MUTE === 'true' || false;

var rtm = new RtmClient(process.env.SLACK_TOKEN, {
    logLevel: '',
    dataStore: new MemoryDataStore,
});

var web = new WebClient(process.env.SLACK_TOKEN);

rtm.start();


function getMessages() {
    return new Promise(function(resolve) {
       var dayMessage = day.getMessage();

        truck.getMessage().then(function(truckMessage) {
            var messages = [];
            dayMessage && messages.push(dayMessage);
            truckMessage && messages.push(truckMessage);
            resolve(messages);
        });
    });
}


function getChannelId(ds, name) {
    var channel = ds.getChannelByName(name);
    if (!channel) {
        channel = ds.getDMByName(name);
    }
    return channel;
}


rtm.on(RTM_CLIENT_EVENTS.RTM_CONNECTION_OPENED, function () {
    getMessages().then(function(messages) {
        if (messages.length && !mute) {
            console.log('sending message...');
            var channel = getChannelId(rtm.dataStore, toChannel);
            var sent = 0;
            messages.map(function(message) {
                var args = {
                    text: message,
                    unfurl_links: false,
                };
                web.chat.postMessage(channel.id, args, function(err) {
                    console.log('message sent', err);
                    sent += 1;
                    if (sent === message.length) {
                        rtm.disconnect();
                        process.exit();
                    }
                });
            });
        } else {
            console.log('no message to sent');
        }
    });
});

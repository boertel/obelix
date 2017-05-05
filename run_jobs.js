var RtmClient = require('@slack/client').RtmClient,
    RTM_EVENTS = require('@slack/client').RTM_EVENTS,
    RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM,
    MemoryDataStore = require('@slack/client').MemoryDataStore,
    _ = require('lodash');


function getChannelId(ds, name) {
    var channel = ds.getChannelByName(name);
    if (!channel) {
        channel = ds.getDMByName(name);
    }
    return channel;
}

// create a bot
var toChannel = process.env.SLACK_TO_CHANNEL || 'random',
    MUTE = process.env.BOT_MUTE === 'true' || false;

var rtm = new RtmClient(process.env.SLACK_TOKEN, {
    logLevel: '',
    dataStore: new MemoryDataStore,
});

rtm.start();

var jobs = {
    'food': require('./jobs/food'),
    'truck': require('./jobs/truck'),
    'weather': require('./jobs/weather'),
}

function sendMessage(channel) {
    return function (message) {
        return new Promise(function (resolve, reject) {
            var args = {
                text: message,
                channel: channel.id,
                type: RTM_EVENTS.MESSAGE,
            };
            if (!MUTE) {
                rtm.send(args, function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        revolve();
                    }
                });
            } else {
                console.log('System is muted, should sent: ', message);
                resolve();
            }
        });
    }
}

function sendMessages(messages) {
    if (!Array.isArray(messages)) {
        messages = [messages]
    }
    var channel = getChannelId(rtm.dataStore, toChannel);
    console.log('sending ' + messages.length + ' messages');
    return new Promise(function(resolve, reject) {
        if (messages.length) {
            var promises = messages.map(sendMessage(channel))
            Promise.all(promises)
            .then(function() {
                resolve()
            })
            .catch(function () {
                reject('error while sending messages');
            });
        } else {
            console.log('no message to sent');
            resolve();
        }
    });
}


rtm.on(RTM_CLIENT_EVENTS.RTM_CONNECTION_OPENED, function () {
    jobs['weather'].run()
        .then(sendMessages)
        .then(function() {
            console.log('done');
            rtm.disconnect()
            process.exit()
        })
        .catch(function(err) {
            console.error('ERROR', err);
            rtm.disconnect()
            process.exit()
        })
});

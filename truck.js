var https = require('https');
var URL = require('url').URL;


var INFRASTRUCKTURE_URL = 'https://www.infrastruckture.com/public-api/events';

function generateYelpSearch(name) {
    var name = encodeURIComponent(name);
    return 'https://www.yelp.com/search?find_desc=' + name;
}

function get(url, callback) {
    var parseURL = new URL(url);
    var path = parseURL.pathname + parseURL.search;
    var options = {
        host: parseURL.host,
        path: path,
        protocol: parseURL.protocol,
        method: 'GET',
        headers: {
            'authorization': 'Bearer ' + process.env.INFRASTRUCKTURE_TOKEN,
        },
    };

    var promise = new Promise(function (resolve, reject) {
            https.get(options, function(response) {
                var body = '';
                response.on('data', function(d) {
                    body += d;
                });

                response.on('end', function() {
                    var parsed = JSON.parse(body);
                    resolve(parsed);
                });
            });
    });

    return promise;
}

function today() {
    var now = new Date(),
        year = now.getFullYear(),
        day = now.getDate(),
        month = now.getMonth() + 1;

    day = day < 10 ? '0' + day : day;
    month = month < 10 ? '0' + month : month;
    return [year, month, day].join('-');
}

function getEvents() {
    var from_ = (new Date(today()).getTime()),
        to_ = from_ + (1000 * 60 * 60 * 24 * 7),
        locationId = process.env.LOCATION_ID;
    return get(INFRASTRUCKTURE_URL + '?dateFrom=' + from_ + '&locationId=' + locationId + '&dateTo=' + to_).then(function(response) {
        if (response.data.error) {
            throw new Error(response.data.message)
        } else {
            var events = response.data.events;
            var firstEvent = events[0];

            if (firstEvent.startTime.indexOf(today()) !== -1) {
                return firstEvent;
            } else {
                throw new Error('no events found.')
            }
        }
    });
}

function getVendors(evt) {
    return get(INFRASTRUCKTURE_URL + '/' + evt.id).then(function(response) {
        var vendors = [];
        vendors = response.data.event.services;
        if (vendors.length) {
            return vendors;
        }
    });
}

function getMessage() {
    return getEvents()
        .then(getVendors)
        .then(function(vendors) {
            var message;
            if (vendors.length) {
                var output = ['Today\'s food trucks are:'];
                vendors.forEach(function(vendor) {
                    output.push('- _' + vendor.name + '_');
                });
                message = output.join('\n');
            }
            return message;
        })
        .catch(function(error) {
            console.log('error', error.message);
        });

}


module.exports = {
    getMessage: getMessage,
}

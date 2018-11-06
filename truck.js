var https = require('https');
var URL = require('url').URL;


var INFRASTRUCKTURE_URL = 'https://www.infrastruckture.com/public-api/events';
var regex = /var OTG_API_JWT = "(.*)";/gm;

function generateYelpSearch(name) {
    var name = encodeURIComponent(name);
    return 'https://www.yelp.com/search?find_desc=' + name;
}

function getToken(callback) {
    https.get('https://offthegrid.com/', function(response) {
        var body = '';
        response.on('data', function(d) {
            body += d;
        });

        response.on('end', function() {
            while ((m = regex.exec(body)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex.lastIndex) {
                    regex.lastIndex++;
                }
                // The result can be accessed through the `m`-variable.
                callback(m[1]);
            }
        });
    });
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
        },
    };

    var promise = new Promise(function (resolve, reject) {
        getToken(function (token) {
            options.headers['authorization'] = token;
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

function getOTGLink(vendor) {
    return 'https://offthegrid.com/vendor/' + vendor.name.toLowerCase().replace(/ /g, '-').replace(/'/g, '');
}

function getMessage() {
    return getEvents()
        .then(getVendors)
        .then(function(vendors) {
            var message;
            if (vendors.length) {
                var output = ['Today\'s food trucks are:'];
                vendors.forEach(function(vendor) {
                    output.push('- <' + getOTGLink(vendor) + '|' + vendor.name + '>');
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

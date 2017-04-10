var https = require('https');
var url = require('url');


var INFRASTRUCKTURE_URL = 'https://www.infrastruckture.com/public-api/events';

function get(url, callback) {
    var parseURL = url.parse(url);
    var options = {
        host: parseURL.host,
        path: parseURL.path,
        protocol: parseURL.protocol,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + process.env.INFRASTRUCKTURE_TOKEN,
        },
    };
    
    console.log(options);
    
    var promise = new Promise(function (resolve) {
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
    var to_ = (new Date().getTime()),
        from_ = to_ + (1000 * 60 * 60 * 24 * 7),
        locationId = process.env.LOCATION_ID;
    return get(INFRASTRUCKTURE_URL + '?dateTo=' + to_ + '&locationId=' + locationId + '&dateFrom=' + from_).then(function(response) {
        var events = response.data.events;
        var firstEvent = events[0];
        
        if (firstEvent.startTime.indexOf(today()) !== -1) {
            return firstEvent;
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

function generateYelpSearch(name) {
    var name = encodeURIComponent(name);
    return 'https://www.yelp.com/search?find_desc=' + name;
}

function getMessage() {
    getEvents()
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
        });

}


module.exports = {
    getMessage: getMessage,
}

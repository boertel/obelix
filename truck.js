var https = require('https');

function get(url, callback) {
    https.get(process.env.OFFTHEGRID_URL, function(response) {
        var body = '';
        response.on('data', function(d) {
            body += d;
        });

        response.on('end', function() {
            var parsed = JSON.parse(body);
            callback && callback(parsed);
        });
    });
}

function getVendors(callback) {
    get(process.OFFTHEGRID_URL, function(response) {
        var events = response.MarketDetail.Events;
        if (events.length) {
            var event = events[0].Event;
            var vendors = [];

            var date = event.year + '-' + (event.month_day.replace('.', '-'));

            var now = new Date(),
                year = now.getFullYear(),
                day = now.getDate(),
                month = now.getMonth() + 1;

            day = day < 10 ? '0' + day : day;
            month = month < 10 ? '0' + month : month;

            var key = [year, month, day].join('-');

            if (date === key) {
                vendors = events[0].Vendors;
            }
            callback && callback(vendors);
        }
    });
}

function getMessage(callback) {
    getVendors(function(vendors) {
        var message;
        if (vendors.length) {
            var output = ['Today food trucks are:'];
            vendors.forEach(function(vendor) {
                output.push('- _' + vendor.name + '_ (' + vendor.cuisine + ') - ' + vendor.website);
            });
            message = output.join('\n');
        }
        callback && callback(message);
    });

}


module.exports = {
    getMessage: getMessage,
}

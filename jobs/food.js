var day = require('../lib/day'),
    truck = require('../lib/truck');


function run() {
    return new Promise(function (resolve, reject) {
        var dayMessage = day.getMessage();

        truck.getMessage().then(function(truckMessage) {
            var messages = [];
            dayMessage && messages.push(dayMessage);
            truckMessage && messages.push(truckMessage);
            resolve(messages);
        });
    });
}

module.exports = {
    run: run,
}

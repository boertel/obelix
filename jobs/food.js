var day = require('../lib/day'),
    truck = require('../lib/truck');


function run() {
    return new Promise(function (resolve, reject) {
        var dayMessage = day.getMessage();
        resolve(dayMessage)
    });
}

module.exports = {
    run: run,
}

var trucks = require('./lib/truck')

trucks.getMessage().then(function(m) {
    console.log(m);
});

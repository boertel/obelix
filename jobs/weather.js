var weather = require('../lib/weather')

function run() {
    return weather.getWeatherStatus()
}

module.exports = {
    run: run,
}

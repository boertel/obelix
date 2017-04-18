var YQL = require('yql');
var weatherEmojis = require('./weatherEmojis');

// https://developer.yahoo.com/weather/documentation.html

LOCATION = process.env.WEATHER_LOCATION;

var query = new YQL('select item.condition from weather.forecast where woeid in (select woeid from geo.places(1) where text="' + LOCATION + '")');


function getWeather() {
    return new Promise(function (resolve, reject) {
        query.exec(function(err, data) {
            if (err) {
                reject(err);
            }
            var condition = data.query.results.channel.item.condition;
            /*
             * "condition": { "code": "28", "date": "Mon, 17 Apr 2017 04:00 PM PDT", "temp": "73", "text": "Mostly Cloudy" }
             */
            resolve(condition);
        });
    })
}

function getText(condition) {
    return condition.text + ' (' + condition.temp + 'ºF)';
}

function getEmoji(condition) {
    return weatherEmojis[condition.code].emoji;
}

function getWeatherStatus() {
    return getWeather().then(function (condition) {
        var custom_status = {
            status_text: getText(condition),
            status_emoji: getEmoji(condition),
        }
        return [custom_status];
    });
}


module.exports = {
    getWeather: getWeather,
    getWeatherStatus: getWeatherStatus,
}

var foods = require('./foods');


function findFoodDay() {
    var now = new Date(),
        day = now.getDate(),
        month = now.getMonth() + 1;

    day = day < 10 ? '0' + day : day;
    month = month < 10 ? '0' + month : month;

    var key = month + '-' + day;
    return foods[key];
}

function createMessage(foodsList) {
    var foodsOfDay = foodsList.map(function(food) {
        return '*' + food + '*'
    })
    var message = 'Today is National ' + commasAnd(foodsOfDay) + ' Day. Bon appétit!';
    return message;
}

function commasAnd(a) {
    return [a.slice(0, -1).join(', '), a.slice(-1)[0]].join(a.length < 2 ? '' : ' and ');
}

function getMessage() {
    var foodsOfDay = findFoodDay();
    if (foodsOfDay) {
        return createMessage(foodsOfDay);
    }
}

module.exports = {
    getMessage: getMessage,
}


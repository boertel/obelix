var WebClient = require('@slack/client').WebClient;
var token = process.env.SLACK_API_TOKEN || '';

var web = new WebClient(token);

web.users.profile.set({ status_text: 'Rain (55ºF)', status_emoji: ':rain_cloud:' }, function(err, info) {
   //err is set if there was an error
   //otherwise info will be an object that contains the result of the call
   if (!err) {
       console.log(info.howdy);
   }
});


# Obélix

Origin of the name: https://en.wikipedia.org/wiki/Obelix

## Install
### Add bot to slack and get a token
1. Go to: http://your-team.slack.com/apps/manage/custom-integrations
2. Bots
3. Add Configuration

### Environment variables
Required:
```
export SLACK_TOKEN="<your slack bot token>"
```
Optional:
```
# default to #random
export SLACK_TO_CHANNEL="<channel where obelix will post>"
export BOT_MUTE="false"
```

### Dependencies
```
$ npm install
```

## Run
```
$ node jobs.js
```

## and then... :boom:
![](https://s3.amazonaws.com/f.cl.ly/items/0C0E07023t2E2h0z2V01/Screen%20Shot%202016-07-20%20at%209.37.57%20AM.png)

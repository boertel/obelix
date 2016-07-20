# Obélix

Origin of the name: https://en.wikipedia.org/wiki/Obelix

## Add bot to slack and get a token
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
export SLACK_TO_CHANNEL="<channel where obelix will post>"
export BOT_MUTE="false"
```

## Run
```
$ npm install
$ npm start
```

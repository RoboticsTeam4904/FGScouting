# fgscouting

> Offline-enabled stand scouting for frc teams.

## Build Setup

``` bash
# install dependencies
yarn install

# serve with hot reload at localhost:8080
yarn run dev

# build for production with minification
yarn run build

# build for production and view the bundle analyzer report
yarn run build --report
```

## Customization (for use with your team!)

To configure the website for use with your team, there are a few variables you need to configure in `/src/App.vue`. Around lines 40-50 in `App.vue`, they are the following:

``` 
SHEET: 'J7yasGSS4CMEID2nogwUNxs2zEc4KBgfxqziY95C_MBv',
APIKEY: '9MIkuwmFuNjAOu30iUOxZEDPO8bC0tLWxP2OpcA',
CLIENTID: 'wf35iOesSq0rJFm-KtXgAiAV4sfAb4BLexw8mAR0eDhPG.apps.googleusercontent.com',
EMAIL_DOMAIN: 'nuevaschool.org',
```

* `SHEET` is the ID of your results spreadsheet. To find the ID navigate to the google sheet, for example `https://docs.google.com/spreadsheets/d/abcde/edit#gid=0`, and copy the string between `/d/` and `/edit`. In this case, it'd be `abcde`
* `APIKEY` is your google sheets API key, and `CLIENTID` is the client ID of your Oauth 2.0 Instance. To generate both of those, head to [https://developers.google.com/sheets/api/guides/authorizing#APIKey](https://developers.google.com/sheets/api/guides/authorizing#APIKey), and then copy the link.
* Finally, to verify that only users from your school/team can scout for your team (to make the data accurate), we use the custom domain that our school provides. Ours is `nuevaschool.org`, but replace `EMAIL_DOMAIN` with what your school uses!
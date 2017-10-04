<template>
  <Loader v-if="applicationStatus==='initializing'"></Loader>
</template>

<script>
import Loader from './components/Loader'

export default {
  name: 'app',
  components: {Loader},
  data() {
    return {
      applicationStatus: 'initializing'
    }
  },
  mounted() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/static/worker.js').then(function(registration) {
      }).catch(function(error) {
        console.error('Service worker registration failed:', error);
      });
    } else {
      console.error('Service workers are not supported.');
    }
    function updateSigninStatus(event) {
      console.log(event)
    }
    var GoogleAuth;
    gapi.load('client:auth2', initClient);
    function initClient() {
      gapi.client.init({
        'apiKey': 'AIzaSyA4HBGkcCkWXXwOkKB0jdPqIaSCOTenR-k',
        'clientId': '692884782115-u4o2n8dco40hjqa18b1agl9492m05l1j.apps.googleusercontent.com',
        'scope': 'https://www.googleapis.com/auth/spreadsheets'
      }).then(function () {
        GoogleAuth = gapi.auth2.getAuthInstance();
      });
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Arvo');

body, html {
  font-family: 'Arvo', 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  box-sizing: border-box;
  background-color: #0a2634;
}
</style>

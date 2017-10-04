<template>
  <span>
    <Loader v-if="applicationStatus==='initializing'"></Loader>
    <ErrorPage v-if="applicationStatus==='fatalError'" :text="failureText"></ErrorPage>
    <SignInPage v-if="applicationStatus==='signIn'" :errorMessage="signInErrorMessage" :callback="signIn"></SignInPage>
    <ScoutingForm v-if="applicationStatus==='scouting'"></ScoutingForm>
  </span>
</template>

<script>
import Loader from './components/Loader'
import ErrorPage from './components/ErrorPage'
import SignInPage from './components/SignInPage'
import ScoutingForm from './components/ScoutingForm'

export default {
  name: 'app',
  components: {Loader, ErrorPage, SignInPage, ScoutingForm},
  data() {
    return {
      applicationStatus: 'initializing',
      isConnected: false,
      failureText: '',
      failureType: undefined,
      signInErrorMessage: '',
      googleAuthObject: null,
      googleUser: null,
      isSignedIn: false
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
    this.initialize()
    window.addEventListener('online',  this.updateConnectionStatus);
    window.addEventListener('offline', this.updateConnectionStatus);
  },
  methods: {
    initialize: function () {
      if (navigator.onLine){
        gapi.load('client:auth2', initClient.bind(this));
        function initClient() {
          gapi.client.init({
            'apiKey': 'AIzaSyA4HBGkcCkWXXwOkKB0jdPqIaSCOTenR-k',
            'clientId': '692884782115-u4o2n8dco40hjqa18b1agl9492m05l1j.apps.googleusercontent.com',
            'scope': 'https://www.googleapis.com/auth/spreadsheets'
          }).then(function () {
            this.googleAuthObject = gapi.auth2.getAuthInstance();
            this.isConnected = true;
            this.applicationStatus = 'signIn';
          }.bind(this));
        }
      }
      else {
        if (localStorage.getItem("questions") === null) {
          this.applicationStatus = 'fatalError'
          this.failureText = 'No local cache found, please connect your computer to the internet. Waiting for connection.'
          this.failureType = 'init_network'
        }
      }
    },
    updateConnectionStatus: function(event) {
      this.isConnected = navigator.onLine
      if (this.applicationStatus === 'fatalError' && this.failureType === 'init_network') {
        this.applicationStatus = 'initializing'
        this.initialize()
      }
      if (this.isConnected === false && this.applicationStatus === 'signIn') {
        this.initialize()
      }
    },
    signIn: function() {
      this.googleAuthObject.signIn().then(function(){
        this.updateSignInStatus(true)
      }.bind(this), function(){
        this.updateSignInStatus(false)
      }.bind(this))
    },
    updateSignInStatus: function(isSignedIn) {
      this.isSignedIn = isSignedIn
      if (isSignedIn && this.googleAuthObject.currentUser.get().hasGrantedScopes('https://www.googleapis.com/auth/spreadsheets')) {
        this.googleUser = this.googleAuthObject.currentUser.get();
        this.applicationStatus = 'scouting'
        console.log(this.googleUser.getBasicProfile().getName())
      }
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
  font-size: 14px;
  line-height: 1.4;
  margin: 0;
  box-sizing: border-box;
  background-color: #0a2634;
}

.mshadow {
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  transition: all 0.3s cubic-bezier(.25,.8,.25,1);
}

.mshadow:not(.static):hover {
  box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
}
</style>

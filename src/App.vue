<template>
  <span>
    <Loader v-if="applicationStatus==='initializing'"></Loader>
    <ErrorPage v-if="applicationStatus==='fatalError'" :text="failureText"></ErrorPage>
    <SignInPage v-if="applicationStatus==='signIn'" :errorMessage="signInErrorMessage" :callback="signIn"></SignInPage>
    <ScoutingForm v-if="applicationStatus==='scouting'" :signOut="signOut"></ScoutingForm>
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
      navigator.serviceWorker.register('/worker.js').then(function(registration) {
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
            'scope': 'https://www.googleapis.com/auth/spreadsheets',
            'discoveryDocs': ['https://sheets.googleapis.com/$discovery/rest?version=v4']
          }).then(function () {
            this.googleAuthObject = gapi.auth2.getAuthInstance();
            this.isConnected = true;
            this.applicationStatus = 'signIn';
            if (this.googleAuthObject.currentUser.get().getBasicProfile()){
              this.isSignedIn = true
              this.applicationStatus = 'scouting'
              this.initializeFormData()
            }
          }.bind(this));
        }
      }
      else {
        var db;
        var request = indexedDB.open("fgscouting", 1);
        request.onupgradeneeded = function(event) {
          var db = request.result;
          if (event.oldVersion < 1) {
            var questionStore = db.createObjectStore("questions", { keyPath: "id" });
          }
          db = request.result;
        }
        request.onsuccess = function(ev) {
          db = request.result;
          var tx = db.transaction("questions", "readonly");
          var store = tx.objectStore("questions");
          var countRequest = store.count()
          countRequest.onsuccess = function() {
            if (countRequest.result === 0){
              this.applicationStatus = 'fatalError'
              this.failureText = 'No local cache found, please connect your computer to the internet. Waiting for connection.'
              this.failureType = 'init_network'
            }
          }.bind(this)
        }.bind(this)
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
      this.signInErrorMessage = ''
      this.googleAuthObject.signIn().then(function(){
        this.updateSignInStatus(true)
      }.bind(this), function(){
        this.updateSignInStatus(false)
      }.bind(this))
    },
    updateSignInStatus: function(isSignedIn) {
      if (isSignedIn && this.googleAuthObject.currentUser.get().hasGrantedScopes('https://www.googleapis.com/auth/spreadsheets')) {
        if(this.googleAuthObject.currentUser.get().getBasicProfile().getEmail().split('@')[1]==='nuevaschool.org' ) {
          this.googleUser = this.googleAuthObject.currentUser.get()
          this.applicationStatus = 'scouting'
          this.isSignedIn = true;
          this.initializeFormData()
        }
        else {
          this.googleAuthObject.signOut()
          this.signInErrorMessage='You must be a member of the "nuevaschool.org" domain to use this application.'
          this.isSignedIn = false;
        }
      }
      else {
        this.googleAuthObject.signOut()
        this.isSignedIn = false;
      }
    },
    signOut: function() {
      this.googleAuthObject.signOut().then(function(){
        this.isSignedIn = false
        this.applicationStatus = 'signIn'
      }.bind(this))
    },
    initializeFormData: function() {
      if (this.isConnected && this.isSignedIn) {
        gapi.client.sheets.spreadsheets.values.get({
          spreadsheetId: '17HY8J_bdG5IcM9YIUYaZts3OorVd9TvavfLLpSoKkwY',
          range: 'Questions',
        }).then(function(response){
          console.log(response.result)
        })
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

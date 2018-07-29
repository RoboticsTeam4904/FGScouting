<template>
<span>
  <div :class="prompting ? 'overlay active' : 'overlay'">
    <div class="prompt mshadow static">
      <div class="message">{{promptmessage[0]}}</div>
      <div class="subtext">{{promptmessage[1]}}<br/><div class="closemessage">Tap anywhere or press any key to continue</div></div>
    </div>
  </div>
  <div :class="prompting ? 'cont overlayed' : 'cont'">
    <Loader v-if="applicationStatus==='initializing'"></Loader>
    <ErrorPage v-if="applicationStatus==='fatalError'" :text="failureText"></ErrorPage>
    <SignInPage v-if="applicationStatus==='signIn'" :errorMessage="signInErrorMessage" :callback="signIn"></SignInPage>
    <ScoutingForm @prompt="prompt" @submit="submit" :networkStatus="isConnected" v-if="applicationStatus==='scouting'" :signOut="signOut" :questions="questions"></ScoutingForm>
  </div>
</span>
</template>

<script>
import Loader from "./components/Loader";
import ErrorPage from "./components/ErrorPage";
import SignInPage from "./components/SignInPage";
import ScoutingForm from "./components/ScoutingForm";

export default {
  name: "app",
  components: { Loader, ErrorPage, SignInPage, ScoutingForm },
  data() {
    return {
      applicationStatus: "initializing",
      isConnected: false,
      failureText: "",
      failureType: undefined,
      signInErrorMessage: "",
      googleAuthObject: null,
      googleUser: null,
      isSignedIn: false,
      db: null,
      dbStatus: null,
      questions: [],
      prompting: false,
      promptmessage: [],
      CACHE: 'network-or-cache',
      SHEET: '17HY8J_bdG5IcM9YIUYaZts3OorVd9TvavfLLpSoKkwY',
      APIKEY: 'AIzaSyA4HBGkcCkWXXwOkKB0jdPqIaSCOTenR-k',
      CLIENTID: '692884782115-u4o2n8dco40hjqa18b1agl9492m05l1j.apps.googleusercontent.com',
      CLIENT: ''
    };
  },
  mounted() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/worker.js")
        .then(
          function(registration) {
            navigator.serviceWorker.addEventListener(
              "message",
              function(event) {
                if (event.data.type === "updateQuestions") {
                  this.applicationStatus = "scouting";
                  this.updateQuestions();
                }
                if (event.data.type === "updateTokens") {
                  this.updateTokens();
                }
              }.bind(this)
            );
            navigator.serviceWorker.ready.then(function(swRegistration) {
              return swRegistration.sync.register("dbPush");
            });
          }.bind(this)
        )
        .catch(function(error) {
          console.error("Service worker registration failed:", error);
        });
    } else {
      console.error("Service workers are not supported.");
    }
    this.initialize();
    window.addEventListener("online", this.updateConnectionStatus);
    window.addEventListener("online", this.dataPush)
    window.addEventListener("offline", this.updateConnectionStatus);
    window.addEventListener("keyup", event => {
      if (this.prompting) this.prompting = false;
    });
    window.addEventListener("touchstart", event => {
      if (this.prompting) this.prompting = false;
    });
    window.addEventListener("mousedown", event => {
      if (this.prompting) this.prompting = false;
    });
  },
  methods: {
    initialize: function() {
      if (navigator.onLine) {
        this.isConnected = true;
      }
      var request = indexedDB.open("fgscouting", 1);
      request.onupgradeneeded = function(event) {
        this.db = request.result;
        if (event.oldVersion < 1) {
          var questionStore = this.db.createObjectStore("questions", {
            keyPath: "id",
            autoIncrement: true
          });
          var tokenStore = this.db.createObjectStore("tokens", {
            keyPath: "id"
          });
          var responsesStore = this.db.createObjectStore("responses", {
            keyPath: "id",
            autoIncrement: true
          });
        }
        this.db = request.result;
      };
      request.onsuccess = function(ev) {
        this.db = request.result;
        var tx = this.db.transaction("questions", "readonly");
        var store = tx.objectStore("questions");
        var countRequest = store.count();
        countRequest.onsuccess = function() {
          if (countRequest.result === 0) {
            if (!navigator.onLine) {
              this.dbStatus = false;
              this.applicationStatus = "fatalError";
              this.failureText =
                "No local cache found, please connect your device to the internet. Waiting for connection.";
              this.failureType = "init_network";
            }
          } else {
            this.updateQuestions();
          }
        }.bind(this);
        if (navigator.onLine) {
          gapi.load("client:auth2", initClient.bind(this));
          function initClient() {
            gapi.client
              .init({
                apiKey: this.APIKEY,
                clientId: this.CLIENTID,
                scope: "https://www.googleapis.com/auth/spreadsheets",
                discoveryDocs: [
                  "https://sheets.googleapis.com/$discovery/rest?version=v4"
                ]
              })
              .then(
                function() {
                  this.googleAuthObject = gapi.auth2.getAuthInstance();
                  this.isConnected = true;
                  if (
                    this.googleAuthObject.currentUser.get().getBasicProfile()
                  ) {
                    this.isSignedIn = true;
                    this.googleUser = this.googleAuthObject.currentUser.get();
                    this.initializeFormData();
                  } else {
                    this.applicationStatus = "signIn";
                  }
                }.bind(this)
              );
          }
        }
      }.bind(this);
      request.onerror = function(ev) {
        this.dbStatus = false;
      }.bind(this);
    },
    updateConnectionStatus: function(event) {
      this.isConnected = navigator.onLine;
      if (
        this.applicationStatus === "fatalError" &&
        this.failureType === "init_network"
      ) {
        this.applicationStatus = "initializing";
        this.initialize();
      }
      if (this.isConnected === false && this.applicationStatus === "signIn") {
        this.initialize();
      }
    },
    signIn: function() {
      this.signInErrorMessage = "";
      this.googleAuthObject.signIn().then(
        function() {
          this.updateSignInStatus(true);
          this.initializeFormData();
        }.bind(this),
        function() {
          this.updateSignInStatus(false);
        }.bind(this)
      );
    },
    updateSignInStatus: function(isSignedIn) {
      if (
        isSignedIn &&
        this.googleAuthObject.currentUser
          .get()
          .hasGrantedScopes("https://www.googleapis.com/auth/spreadsheets")
      ) {
        if (
          this.googleAuthObject.currentUser
            .get()
            .getBasicProfile()
            .getEmail()
            .split("@")[1] === "nuevaschool.org"
        ) {
          this.googleUser = this.googleAuthObject.currentUser.get();
          this.applicationStatus = "scouting";
          this.isSignedIn = true;
        } else {
          this.googleAuthObject.disconnect();
          this.googleAuthObject.signOut();
          this.signInErrorMessage =
            'You must be a member of the "nuevaschool.org" domain to use this application.';
          this.isSignedIn = false;
        }
      } else {
        this.googleAuthObject.signOut();
        this.isSignedIn = false;
      }
    },
    signOut: function() {
      this.googleAuthObject.signOut().then(
        function() {
          this.isSignedIn = false;
          this.applicationStatus = "signIn";
        }.bind(this)
      );
    },
    initializeFormData: function() {
      if (this.isConnected && this.isSignedIn) {
        var tx = this.db.transaction("tokens", "readwrite");
        var store = tx.objectStore("tokens");
        var clearTokens = store.clear();
        clearTokens.onsuccess = function(value) {
          store.add({
            token: this.googleAuthObject.currentUser.get().getAuthResponse(true)
              .access_token,
            expires_at: this.googleAuthObject.currentUser
              .get()
              .getAuthResponse(true).expires_at,
            name: this.googleAuthObject.currentUser
              .get()
              .getBasicProfile()
              .getName(),
            id: 1
          }).onsuccess = function() {
            this.dataPull();
          }.bind(this);
        }.bind(this);
      }
    },
    updateQuestions: function() {
      var tx = this.db.transaction("questions", "readonly");
      var store = tx.objectStore("questions");
      var getQuestions = store.getAll();
      getQuestions.onsuccess = () => {
        this.questions = getQuestions.result;
        this.applicationStatus = "scouting";
      };
    },
    submit: function(state) {
      var tx = this.db.transaction("responses", "readwrite");
      var store = tx.objectStore("responses");
      var addResponses = (store.add(state).onsuccess = this.dataPush());
    },
    dataPush: function() {
      if (navigator.onLine) {
        var db;
        var request = indexedDB.open("fgscouting", 1);
        request.sheet_loc = this.SHEET;
        request.onsuccess = ev => {
          db = request.result;
          var tokentx = db.transaction("tokens", "readonly");
          var tokenstore = tokentx.objectStore("tokens");
          var tokenreq = tokenstore.get(1);
          tokenreq.sheet_loc = request.sheet_loc;
          tokenreq.onsuccess = function() {
            var token = tokenreq.result;
            if (
              token &&
              token.expires_at - 2000 > Math.round(new Date().getTime())
            ) {
              token = token.token;
              var tx = db.transaction("responses", "readwrite");
              var store = tx.objectStore("responses");
              var getResponses = store.getAll();
              getResponses.sheet_loc = tokenreq.sheet_loc;
              getResponses.onsuccess = function() {
                fetch(
                  `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`
                )
                  .then(response => {
                    return response.json();
                  })
                  .then(value => {
                    if (!value.error) {
                      var responses = getResponses.result;
                      var values = [];
                      for (var i = 0; i < responses.length; i++) {
                        values.push(Object.values(responses[i]));
                      }
                      fetch(
                        `https://sheets.googleapis.com/v4/spreadsheets/${getResponses.sheet_loc}/values/Responses?access_token=${token}`
                      )
                        .then(response => {
                          return response.json();
                        })
                        .then(result => {
                          var a1notation = result.values
                            ? "C" + (result.values.length + 1).toString()
                            : "C1";
                          fetch(
                            `https://sheets.googleapis.com/v4/spreadsheets/${getResponses.sheet_loc}/values/Responses!${a1notation}?valueInputOption=USER_ENTERED&access_token=${token}`,
                            {
                              method: "PUT",
                              body: JSON.stringify({
                                values: values,
                                range: `Responses!${a1notation}`
                              })
                            }
                          )
                            .then(response => {
                              return response.json();
                            })
                            .then(result => {
                              tx = db.transaction("responses", "readwrite");
                              store = tx.objectStore("responses");
                              var clearResponses = store.clear();
                              clearResponses.onsuccess = function(value) {
                                return true;
                              };
                              clearResponses.onerror = function(error) {
                                return false;
                              };
                            })
                            .catch(error => {
                              return false;
                            });
                        })
                        .catch(error => {
                          return false
                        });
                      return true;
                    } else {
                      return false;
                    }
                  })
                  .catch(error => {
                    return false;
                  });
              };
              getResponses.onerror = function(error) {
                return false;
              };
            } else {
              return false;
            }
          };
          tokenreq.onerror = function(error) {
            return false;
          };
        };
        request.onerror = function(error) {
          return false;
        };
      } else {
        return false;
      }
    },
    dataPull: function() {
      if (navigator.onLine) {
        var db, token;
        var request = indexedDB.open("fgscouting", 1);
        request.onsuccess = ev => {
          db = request.result;
          var tx = db.transaction("tokens", "readonly");
          var store = tx.objectStore("tokens");
          var getTokens = store.get(1);
          getTokens.onsuccess = event => {
            token = getTokens.result.token;
            fetch(
              `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`
            )
              .then(response => {
                return response.json();
              })
              .then(value => {
                if (!value.error) {
                  fetch(
                    `https://sheets.googleapis.com/v4/spreadsheets/${this.SHEET}/values/Questions?access_token=${token}`
                  )
                    .then(response => {
                      return response.json();
                    })
                    .then(value => {
                      var tx = db.transaction("questions", "readwrite");
                      var store = tx.objectStore("questions");
                      var clearQuestions = store.clear();
                      clearQuestions.onsuccess = function(event) {
                        var addQuestion = () => {
                          if (i < data.length) {
                            store.add(data[i]).onsuccess = addQuestion;
                            ++i;
                          } else {
                            return false;
                          }
                        };
                        addQuestion();
                      };
                      clearQuestions.onerror = function(event) {
                        return false
                      };
                      var data = value.values.slice(1);
                      var i = 0;
                    });
                } else {
                  return false
                }
              });
          };
          getTokens.onerror = () => {
            return false
          };
        };
      } else {
        return false
      }
    },
    prompt: function(promptmessage) {
      this.prompting = true;
      this.promptmessage = promptmessage;
    },
    unprompt: function() {
      this.prompting = false;
    },
    updateTokens: function() {
      var tx = this.db.transaction("tokens", "readwrite");
      var store = tx.objectStore("tokens");
      var clearTokens = store.clear();
      clearTokens.onsuccess = function(value) {
        store.add({
          token: this.googleAuthObject.currentUser.get().getAuthResponse(true)
            .access_token,
          expires_at: this.googleAuthObject.currentUser
            .get()
            .getAuthResponse(true).expires_at,
          name: this.googleAuthObject.currentUser
            .get()
            .getBasicProfile()
            .getName(),
          id: 1
        }).onsuccess = function() {
          this.dataPush();
        }.bind(this);
      }.bind(this);
    }
  }
};
</script>

<style>
@font-face {
  font-family: "Arvo";
  font-style: normal;
  font-weight: 400;
  src: local("Arvo"), url(/static/Arvo.woff2) format("woff2");
  unicode-range: U + 0000-00ff, U + 0131, U + 0152-0153, U + 02c6, U + 02da,
    U + 02dc, U + 2000-206f, U + 2074, U + 20ac, U + 2212, U + 2215;
}

body,
html {
  font-family: "Arvo", "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 14px;
  line-height: 1.4;
  margin: 0;
  box-sizing: border-box;
  background-color: #0a2634;
  overflow-x: hidden;
}
.overlay {
  background: transparent;
  will-change: background;
  position: fixed;
  z-index: -1;
  transition: background 0.1s ease-in-out;
}
.cont {
  transition: filter 0.1s ease-in-out;
  will-change: filter;
}
.overlay.active {
  width: 100vw;
  height: 100vh;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  left: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.1);
}
.cont.overlayed {
  filter: blur(5px);
  height: 100vh;
}
.mshadow {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.mshadow:not(.static):hover {
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
}
::-webkit-scrollbar {
  width: 2px;
}
::-webkit-scrollbar-thumb {
  background-color: #3e77bb;
}
.prompt {
  width: 90vw;
  max-width: 400px;
  max-height: 300px;
  background-color: #3e77bb;
  border-radius: 3px;
  display: flex;
  justify-content: flex-start;
  align-content: center;
  flex-flow: column nowrap;
  opacity: 0;
  padding: 20px;
  transition: opacity 0.3s ease-in-out;
}
.active > .prompt {
  opacity: 1;
}
.message {
  font-size: 2rem;
  text-align: center;
  color: white;
  margin-bottom: 20px;
}
.subtext {
  color: white;
  width: 100%;
  text-align: center;
  margin-bottom: 10px;
}
.closemessage {
  padding-top: 10px;
  font-size: 1rem;
}
</style>

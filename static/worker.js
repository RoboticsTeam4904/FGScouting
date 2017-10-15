var CACHE = 'network-or-cache';
var SHEET = '17HY8J_bdG5IcM9YIUYaZts3OorVd9TvavfLLpSoKkwY';
var CLIENT = ''

function colName(n) {
    var ordA = 'a'.charCodeAt(0);
    var ordZ = 'z'.charCodeAt(0);
    var len = ordZ - ordA + 1;

    var s = "";
    while(n >= 0) {
        s = String.fromCharCode(n % len + ordA) + s;
        n = Math.floor(n / len) - 1;
    }
    return s;
}

self.addEventListener('install', function(evt) {
  evt.waitUntil(precache());
});

self.addEventListener('fetch', function(evt) {
  evt.respondWith(navigator.onLine ? fromNetwork(evt.request) : fromCache(evt.request))
});

self.addEventListener('sync', function(event) {
  CLIENT = event.clientId
  if (event.tag == 'dbPush') {
    event.waitUntil(dbPush());
  }
  if (event.tag == 'dbPull') {
    event.waitUntil(dbPull());
  }
});

function precache() {
  return caches.open(CACHE).then(function (cache) {
    return cache.addAll([
      '/app.js',
      '/',
      '/static/Arvo.woff2',
      '/static/logo.png',
      '/static/ionicons.min.css',
      '/static/ionicons.eot',
      '/static/ionicons.svg',
      '/static/ionicons.ttf',
      '/static/ionicons.woff'
    ]);
  });
}

function fromNetwork(request) {
  return new Promise(function (fulfill, reject) {
    fetch(request).then(function (response) {
      fulfill(response);
    }, reject);
  });
}

function dbPush() {
  return new Promise(function (fulfill, reject) {
    if (navigator.onLine) {
      var db
      var request = indexedDB.open("fgscouting", 1);
      request.onsuccess = (ev) => {
        db = request.result
        var tokentx = db.transaction("tokens", "readonly");
        var tokenstore = tokentx.objectStore("tokens");
        var tokenreq = tokenstore.get(1)
        tokenreq.onsuccess = function() {
          var token = tokenreq.result
          if (token.expires_at - 2000 > Math.round((new Date()).getTime())) {
            token = token.token
            var tx = db.transaction("responses", "readwrite");
            var store = tx.objectStore("responses");
            var getResponses = store.getAll()
            getResponses.onsuccess = function() {
              fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`).then((response) => {
                return response.json()
              }).then((value) => {
                if(!value.error) {
                  var responses = getResponses.result
                  var values = []
                  for (var i=0; i<responses.length; i++) {
                    values.push(Object.values(responses[i]).slice(1,-1))
                  }
                  fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET}/values/Responses?access_token=${token}`).then(response => {
                    return response.json()
                  }).then(result => {
                    var a1notation = result.values ? 'A' + (result.values.length+1).toString() : 'A1'
                    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET}/values/Responses!${a1notation}?valueInputOption=USER_ENTERED&access_token=${token}`, {
                      method: "PUT",
                      body: JSON.stringify({
                        values: values,
                        range: `Responses!${a1notation}`
                      })
                    }).then((response) => {
                      return response.json()
                    }).then((result) => {
                      tx = db.transaction("responses", "readwrite");
                      store = tx.objectStore("responses");
                      var clearResponses = store.clear()
                      clearResponses.onsuccess = function(value) {
                        fulfill()
                      }
                      clearResponses.onerror = function(error) {
                        return reject(error)
                      }
                     }).catch((error) => {
                      return reject(error)
                    })
                  }).catch((error) => {
                   return reject(error)
                  })
                  fulfill()
                }
                else {
                  var getTokens = async function () {
                    var client = await clients.matchAll({
                      includeUncontrolled: true
                    })
                    client = client[0]
                    if (client) {
                      client.postMessage({
                        type: "updateTokens"
                      })
                    }
                    reject('Invalid tokens')
                  }
                  getTokens()
                }
              }).catch((error) => { reject(error) })
            }
            getResponses.onerror = function(error) {
              return reject(error)
            }
          }
          else {
            var getTokens = async function () {
              var client = await clients.matchAll({
                includeUncontrolled: true
              })
              client = client[0]
              if (client) {
                client.postMessage({
                  type: "updateTokens"
                })
              }
              reject('Invalid tokens')
            }
            getTokens()
          }
        }
        tokenreq.onerror = function(error) {
          reject(error)
        }
      }
      request.onerror = function(error) {
        reject(error)
      }
    } else {
      reject('Device offline')
    }
  });
}

function dbPull() {
  return new Promise(function (fulfill, reject) {
    if (navigator.onLine){
      var db, token
      var request = indexedDB.open("fgscouting", 1);
      request.onsuccess = (ev) => {
        db = request.result
        var tx = db.transaction("tokens", "readonly")
        var store = tx.objectStore("tokens")
        var getTokens = store.get(1)
        getTokens.onsuccess = (event) => {
          token = getTokens.result.token
          fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`).then((response) => {
            return response.json()
          }).then((value) => {
            if(!value.error) {
              fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET}/values/Questions?access_token=${token}`).then((response) => {
                return response.json()
              }).then((value) => {
                var tx = db.transaction("questions", "readwrite")
                var store = tx.objectStore("questions")
                var clearQuestions = store.clear()
                clearQuestions.onsuccess = function(event) {
                  var addQuestion = () => {
                    if (i<data.length) {
                      store.add(data[i]).onsuccess = addQuestion;
                      ++i;
                    } else {
                      var updateView = async function () {
                        var client = await clients.matchAll({
                          includeUncontrolled: true
                        })
                        client = client[0]
                        if (!client) {
                          fulfill()
                        } else {
                          client.postMessage({
                            type: "updateQuestions"
                          });
                          fulfill()
                        }
                      }
                      updateView()
                    }
                  }
                  addQuestion()
                }
                clearQuestions.onerror = function(event) {
                  reject()
                }
                var data = value.values.slice(1)
                var i = 0;
              })
            } else {
              reject()
            }
          })
        }
        getTokens.onerror = () => {
          reject()
        }
      }
    } else {
      reject()
    }
  });
}

function fromCache(request) {
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (matching) {
      return matching || Promise.reject('no-match');
    });
  });
}

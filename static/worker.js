var CACHE = 'network-or-cache';
var SHEET = '17HY8J_bdG5IcM9YIUYaZts3OorVd9TvavfLLpSoKkwY';
var CLIENT = ''

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
    console.log('push')
    if (navigator.onLine) {
      fulfill()
    } else {
      reject()
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

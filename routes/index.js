var express = require('express');
var clientID = "692884782115-u4o2n8dco40hjqa18b1agl9492m05l1j.apps.googleusercontent.com";
var GoogleAuth = require('google-auth-library');
var auth = new GoogleAuth();
var client = new auth.OAuth2(clientID, '', '');
var router = express.Router();
var currentEmail;

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', {
        title: 'Team 4904s Stand Scouting'
    });
});
router.post('/pushData', function(req, res, next) {
    console.log("starting");
    var db = req.db;
    var resultsHolder = db.get('formResults');
    if(currentEmail == ''){
        res.send('No Email');
    }else if(currentEmail.split('@')[1] !== "nuevaschool.org"){
        res.send('Invalid Email');
    }else{
        var error = false;
        var contentObject = JSON.parse(req.body.content);
        for(var storedData in contentObject){
            if(req.body.content.hasOwnProperty(storedData)){
                cachedData = JSON.parse(contentObject[storedData]);
                resultsHolder.insert(cachedData, function(err, result) {
                    if(err){
                        console.log("Erroring with " + err);
                        error = true;
                    }
                });
            }else{
                console.log("No own property for " + storedData);
            }
        }
        if (error){
            res.send('Data could not be entered.');
        }else{
            res.send('Completed');
        }
    }
});
router.post('/tokensignin', function(req, res, next) {
    client.verifyIdToken(
        req.body.idtoken, 
        clientID, function(e, login) {
            var payload = login.getPayload();
            if(payload.aud == clientID && (payload.iss == "accounts.google.com" || payload.iss == "https://accounts.google.com")){
                currentEmail = payload.email;
                res.send(currentEmail);
            }else{
                res.send("error");
            }   
        });
});
router.post('/tokensignout', function(req, res, next) {
    currentEmail = '';
    res.send('Success');
});


module.exports = router;

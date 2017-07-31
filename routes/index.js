var express = require('express');
var GoogleAuth = require('google-auth-library');
var auth = new GoogleAuth;
var client = new auth.OAuth2("692884782115-u4o2n8dco40hjqa18b1agl9492m05l1j.apps.googleusercontent.com", '', '');
var router = express.Router();
var currentEmail;

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', {
        title: 'Team 4904s Stand Scouting'
    });
});
router.post('/pushData', function(req, res, next) {
    if(currentEmail == ''){
        res.send('No Email');
    }else if(!(currentEmail.split('@')[1] == "nuevaschool.org")){
        res.send('Invalid Email');
    }else{
        var db = req.db;
        var resultsHolder = db.get('formResults');
        resultsHolder.insert(req.body, function(err, result) {
            if (err)
                res.send('Data could not be entered.');
            else
                res.send('Success', '');
        });
    }
});
router.post('/tokensignin', function(req, res, next) {
    client.verifyIdToken(
        req.body.idtoken, 
        "692884782115-u4o2n8dco40hjqa18b1agl9492m05l1j.apps.googleusercontent.com", function(e, login) {
          var payload = login.getPayload();
          currentEmail = payload['email'];
          res.send(currentEmail);
      });
});
router.post('/tokensignout', function(req, res, next) {
    currentEmail = '';
    res.send('Success');
});


module.exports = router;

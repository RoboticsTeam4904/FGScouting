var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', {
        title: 'Team 4904s Stand Scouting'
    });
});
router.post('/pushData', function(req, res, next) {
    var db = req.db;
    var resultsHolder = db.get('formResults');
    resultsHolder.insert(req.body, function(err, result) {
        if (err)
            res.send('Error');
        else
            res.send('Success');
    });
});


module.exports = router;

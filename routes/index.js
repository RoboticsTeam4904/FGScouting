var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {
    title: 'Team 4904s Stand Scouting'
  });
});
router.post('/pushData', function(req, res, next) {
  // console.log("posting");
  var db = req.db;
  // console.log("posting");
  var usersHolder = db.get('users');
  // console.log("posting");
  // console.log("Inserting " + req.body);
  // console.log("posting");
  usersHolder.insert(req.body, function (err, result) {
      if (err)
         res.send('Error');
      else
        res.send('Success');
  });
});


module.exports = router;

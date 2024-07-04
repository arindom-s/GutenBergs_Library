var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect("/catalog");  //This redirects to the specified page, by default sending HTTP status code "302 Found".
});

module.exports = router;

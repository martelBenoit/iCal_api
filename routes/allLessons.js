const express = require('express');
const router = express.Router();

const schedule = require('../src/schedule');

/* GET home page. */
router.get('/', function(req, res, next) {

    var data = {};
    var key = 'lessons';
    data[key] = schedule.getNextLessons();

    res.json(data);

});

module.exports = router;

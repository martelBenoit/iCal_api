var express = require('express');

var router = express.Router();

const schedule = require('../src/schedule');

/* GET users listing. */
router.get('/:id', function(req, res) {

    var id = (req.params.id).toLowerCase();
    if(id === "next"){
        var lessons = schedule.getNextLessons();
        if(lessons !== null){
            var lesson = lessons[0];
        }
        res.json(lesson);
    }
    else if(id === "today"){
        if (schedule.getCours(0)[0] !== undefined){
            res.json(schedule.getCours(0));
        }
        else
            res.json();
    }
    else if(id === "tomorrow"){
        if (schedule.getCours(1)[0] !== undefined){
            res.json(schedule.getCours(1));
        }
        else
            res.json();
    }
    else{
        var id = parseInt(req.params.id,10);
        if(!isNaN(id) && schedule.getCours(id)[0] !== undefined)
            res.json(schedule.getCours(id));
        else
            res.json();

    }

});

module.exports = router;

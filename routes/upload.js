var express = require('express');
var router = express.Router();
var url = require('url');
var mongoose = require('mongoose');

var Page = require('../models/page').Page;

mongoose.connect('mongodb://localhost:27017/test');

router.get('/page', function(req, res, next) {
    res.render('upload_page');
});

router.post('/page', function(req, res, next) {
    var date = new Date();
    var newPage = Page({
        author: 'DesGemini',
        created_at: date,
        updated_at: date
    });
    newPage.content = req.body.page;
    newPage.title = req.body.title;

    // check uniqueness of tags, if true, put it into database
    var tagArr = req.body.tag.split('@');
    var hash = {};
    for (var i in tagArr) {
        if (!hash[tagArr[i]]) {
            hash[tagArr[i]] = true;
            newPage.tags.push({
                name: tagArr[i],
                created_at: date,
                updated_at: date
            });
        }
    }

    newPage.save(function(err, room) {
        if (err) throw err;

        console.log(room);
    });
});

module.exports = router;

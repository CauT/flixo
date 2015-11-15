var express = require('express');
var router = express.Router();
var url = require('url');
var mongoose = require('mongoose');
var marked = require('marked');

var Page = require('../models/page').Page;

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
});

// mongoose.connect('mongodb://localhost:27017/test');

router.get('/page', function(req, res, next) {
    res.render('upload_page', {css_path: '/stylesheets/upload.css'});
});

router.post('/page', function(req, res, next) {
    var date = new Date();
    var newPage = Page({
        author: 'DesGemini',
        created_at: date,
        updated_at: date
    });
    // newPage.content = req.body.page;
    newPage.title = req.body.title;

    // check uniqueness of tags, if true, put it into database
    var tagArr = req.body.tag.split('@');
    var hash = {};
    tagArr.forEach(function(tag) {
        if (!hash[tag]) {
            hash[tag] = true;
            newPage.tags.push({
                name: tag,
                created_at: date,
                updated_at: date
            });
        }
    });

    // convert markdown content to html
    marked(req.body.page, function(err, content) {
        if (err) throw err;
        newPage.content = content;
        newPage.save(function(err, room) {
            if (err) throw err;

            // console.log(room);
            res.redirect('/page/' + room._id);
            // res.render('page', {
            //     css_path: '/stylesheets/greyshade.css',
            //     marked_page: room.content
            // });
        });
    });
});

module.exports = router;

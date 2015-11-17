var express = require('express');
var router = express.Router();
var url = require('url');
var mongoose = require('mongoose');
var marked = require('marked');
var Q = require('q');

var Page = require('../models/page').Page;
var Tag = require('../models/tag').Tag;

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

router.get('/page', function(req, res, next) {
    res.render('upload_page', {css_path: '/stylesheets/upload.css'});
});

router.post('/page', function(req, res, next) {
    var date = new Date();
    var pageId = mongoose.Types.ObjectId();
    var tagId = mongoose.Types.ObjectId();
    var newPage = Page({
        _id: pageId;
        author: 'DesGemini',
        created_at: date,
        updated_at: date
    });
    newPage.title = req.body.title;

    // check uniqueness of tags, if true, put it into database
    // Be careful that if convert markdown is quicker than save tag, tags will be null
    var tagArr = req.body.tag.split('@');
    var hash = {};

    function saveTag() {
        tagArr.forEach(function(tag) {
            if (!hash[tag]) {
                hash[tag] = true;
                Tag.findOne({'name': tag}, '_id', function(err, found) {
                    if(found == undefined) {
                        var newTag = Tag({
                            _id: tagId,
                            name: tag,
                            created_at: date,
                            updated_at: date
                        });
                        newTag.save();
                    } else {
                        found.tags.push(pageId);
                    }
                });
            }
        });
    }

    // convert markdown content to html
    function saveContent() {
        marked(req.body.page, function(err, content) {
            if (err) throw err;
            newPage.content = content;
        });
    }

    Q.all([saveTag(), saveContent()]).done(function() {
        newPage.save(function(err, saved) {
            if (err) throw err;
            res.redirect('/page/' + saved._id);
        });
    });
});

module.exports = router;

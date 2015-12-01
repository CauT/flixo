'use strict';

var express = require('express');
var router = express.Router();
var url = require('url');
var mongoose = require('mongoose');
var marked = require('marked');
var Promise = require('bluebird');

var Page = require('../models/page').Page;
var Tag = Promise.promisifyAll(require('../models/tag').Tag);

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
    var tagIds = [];
    var findTagPromises = [];
    var newPage = Page({
        _id: pageId,
        author: 'DesGemini',
        created_at: date,
        updated_at: date
    });
    newPage.title = req.body.title;

    // check uniqueness of tags, if true, put it into database
    // Be careful that if convert markdown is quicker than save tag, tags will be null
    var tagArr = req.body.tag.split('@');

    var hash = {};
    var pse;
    tagArr.forEach(function(tag) {
        if (!hash[tag]) {
            hash[tag] = true;
            pse = new Promise(function(resolve, reject) {
                Tag.findOne({'name': tag}, 'pages').exec(function(err, found) {
                    if(found == undefined) {
                        var tmpTagId = mongoose.Types.ObjectId();
                        console.log(tmpTagId);
                        tagIds.push(tmpTagId);
                        var newTag = Tag({
                            _id: tmpTagId,
                            name: tag,
                            created_at: date,
                            updated_at: date,
                            pages: [pageId]
                        });
                        resolve({
                            existOrNot: false,
                            value: newTag
                        });
                    } else {
                        resolve({
                            existOrNot: true,
                            value: found._id
                        });
                    }
                });
            });
            pse = pse.then(function(params) {
                if (params.existOrNot) {
                    console.log('exist, the tag id: ', params.value);
                    tagIds.push(params.value);
                    Tag.update({_id: params.value}, {$push: {pages: pageId}}, function (err, raw) {
                        if (err) return handleError(err);
                        console.log('The raw response from Mongo was ', raw);
                    });
                } else {
                    console.log('not exist, the newTag is: ', params.value);
                    params.value.save();
                }
            }, console.log);
            findTagPromises.push(pse);
        }
    });

    // convert markdown content to html
    function saveContent() {
        console.log('save content');
        marked(req.body.page, function(err, content) {
            if (err) throw err;
            newPage.content = content;
        });
    }

    Promise.all(findTagPromises).then(saveContent, console.log).done(function() {
        console.log(tagIds);
        tagIds.forEach(function(tagId) {
            newPage.tags.push(tagId);
        });
        newPage.save(function(err, saved) {
            if (err) throw err;
            res.redirect('/page/' + saved._id);
        });
    });
});

module.exports = router;

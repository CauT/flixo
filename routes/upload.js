var express = require('express');
var router = express.Router();
var url = require('url');
var mongoose = require('mongoose');
var marked = require('marked');
var Promise = require('bluebird');

var Page = require('../models/page').Page;
// var Tag = require('../models/tag').Tag;
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
    var resaveTagPromise;
    var newTag;
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
    // var hash = {};

    console.log('createFindTagPromises');
    // tagArr.forEach(function(tag) {
    //     if (!hash[tag]) {
    //         hash[tag] = true;
    //         var existOrNotThenDeal = Tag.findOne({'name': tag}, 'pages').exec(function(err, found) {
    //             if(found == undefined) {
    //                 var tmpTagId = mongoose.Types.ObjectId();
    //                 console.log(tmpTagId);
    //                 tagIds.push(tmpTagId);
    //                 newTag = Tag({
    //                     _id: tmpTagId,
    //                     name: tag,
    //                     created_at: date,
    //                     updated_at: date,
    //                     pages: [pageId]
    //                 });
    //             } else {
    //                 tagIds.push(found._id);
    //             }
    //         });
    //         findTagPromises.push(existOrNotThenDeal.then(function() {
    //             console.log('save new tag');
    //             console.log(newTag);
    //             newTag.save();
    //         }, function(err) {
    //             console.log(err);
    //             Tag.update({name: tag}, {$push: {pages: pageId}});
    //         }));
    //     }
    // });

    // var createFindTagPromises = new Promise(function(resolve, reject) {
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
                        resolve([false, newTag]);
                    } else {
                        resolve([true, found._id]);
                    }
                });
            });
            pse = pse.then(function(params) {
                if (params[0]) {
                    console.log('exist');
                    console.log(params[1]);
                    tagIds.push(params[1]);
                    Tag.update({_id: params[1]}, {$push: {pages: pageId}}, function (err, raw) {
                        if (err) return handleError(err);
                        console.log('The raw response from Mongo was ', raw);
                    });
                } else {
                    console.log('not exist');
                    console.log(params[1]);
                    params[1].save();
                }
            // }, function(existedTagId) {
            //     console.log(existedTagId);
            //     tagIds.push(existedTagId);
            //     Tag.update({name: tag}, {$push: {pages: pageId}});
            }, console.log);
            findTagPromises.push(pse);
        }
    });

    // createFindTagPromises.then(function(newTag) {
    //     console.log(newTag);
    //     newTag.save();
    // }), function(err) {
    //     console.log(err);
    //     Tag.update({name: tag}, {$push: {pages: pageId}});
    // });

    console.log(findTagPromises);

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

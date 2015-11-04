var express = require('express');
var router = express.Router();
var url = require('url');
var mongoose = require('mongoose');

var Page = require('../models/page');

mongoose.createConnection('mongodb://localhost:27017/test');

// router.get('/', function(req, res, next) {
//     res.render('index', { title: 'Express' });
//    next();
// });

// router.get('/', function(req, res, next) {
//     res.render('index', { title: 'Hello' });
// });

var newPage = Page({
    name: 'a',
    author: 'a',
    content: 'a',
    comments: [
    {
        author: 'b',
        content: 'b',
        created_at: new Date(),
    }],
    tags: [{
        name: 'c',
        created_at: new Date(),
        updated_at: new Date()
    }],
    created_at: new Date(),
    updated_at: new Date()
});

router.get('/', function(req, res, next) {
    res.render('index', {titie: 'Filxo'});
});

router.get('/:pageId', function(req, res, next, pageId) {
    Page.find({ name: 'a' }, function(err, page) {
        // if (err)
        //     throw err;
        // else
        res.send(page.content);
    });
});

// router.param('pageId', function(req, res, next, pageId))

module.exports = router;

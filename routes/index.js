'use strict';

var express = require('express');
var router = express.Router();
var url = require('url');
var mongoose = require('mongoose');

var Page = require('../models/page').Page;

// mongoose.createConnection('mongodb://localhost:27017/test');

// router.get('/', function(req, res, next) {
//     res.render('index', { title: 'Express' });
//    next();
// });

// router.get('/', function(req, res, next) {
//     res.render('index', { title: 'Hello' });
// });

module.exports = router;

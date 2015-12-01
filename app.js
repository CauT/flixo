var express = require('express');
var path = require('path');
// var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Promise = require('bluebird')
// promisify the entire mongoose Model
var Page = Promise.promisifyAll(require('./models/page').Page);
var Tag = Promise.promisifyAll(require('./models/tag').Tag);

var routes = require('./routes/index');
var upload = require('./routes/upload');
var users = require('./routes/users');

var app = express();

var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;


// mongoose.createConnection('mongodb://localhost:27017/test');
mongoose.connect('mongodb://localhost:27017/test');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', function(req, res, next) {
    if (req.url === '/') {
        Page.find({}, 'title _id').sort('-date').exec(function(err, pages) {
            if (err) return err;
            res.render('index', {
                pages: pages
            });
        });
    }
    else
        next();
});

app.get('/tag/:tagId', function(req, res, next) {
    Tag.findOne({_id: req.params.tagId}, 'pages').exec()
    .then(function(result){
        var pagePromises = [];
        result.pages.forEach(function(pageId) {
            const p = Page.findOne({_id: pageId}, 'title').exec();
            pagePromises.push(p);
        });
        return pagePromises;
    })
    .then(function(pagePromises){
        return Promise.all(pagePromises);
    })
    .then(function(values){
        var pageInfos = [];
        values.forEach(function(page){
            pageInfos.push({
                _id: page._id,
                title: page.title
            });
        })
        return pageInfos;
    })
    .then(function(pageInfos){
        res.render('index', {
            pages: pageInfos
        });
    })
});

app.get('/page/:pageId', function(req, res, next) {
    var content;
    
    Page.findOne({ _id: req.params.pageId }, 'title content tags').exec()
    .then(function(page) {
        var findTagNamePromises = [];
        content = page.content;
        page.tags.forEach(function(tagId) {
            const p = Tag.findById(tagId, 'name').exec();
            findTagNamePromises.push(p);
        });
        return findTagNamePromises;
    }, console.log)
    .then(function(findTagNamePromises) {
        return Promise.all(findTagNamePromises);
    })
    .then(function(tags) {
        console.log(tags);
        res.render('page', {
            tags: tags,
            css_path: '/stylesheets/greyshade.css',
            marked_page: content
        });
    }, console.log);
});

app.use('/upload', upload);

app.param('/page/:pageId', function(req, res, next) {
    console.log('add param');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

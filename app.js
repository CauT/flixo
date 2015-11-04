var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

var mongoose = require('mongoose');
var Page = require('./models/page');
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

// app.use('/page/:', routes);
// app.use('/users', users);

// app.use('/page/1', function(req, res, next) {
//     console.log('come in');
//     res.send('come in');
//     next();
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

app.get('/page/:pageId', function(req, res, next) {
        newPage.save(function(err) {
        if (err) throw err;

        console.log('Page created!');
        next();
    });
});

app.get('/page/:pageId', function(req, res, next) {
    // Page.find({ _id: req.params.pageId }, function(err, page) {
    Page.find({ name: req.params.pageId }, function(err, page) {
        if (err)
            throw err;
        else
            console.log(page);
        // res.json(page);
        res.send(page[0].content);
    });
    console.log('find complete');
});

app.param('/page/:pageId', function(req, res, next) {
    console.log('add param');
});
// app.use('/page/:pageId', function(req, res, next, pageId) {
//     Page.find({ _id: pageId }, function(err, page) {
//         // if (err)
//         //     throw err;
//         // else
//             res.send(page.content);
//     });
// });

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

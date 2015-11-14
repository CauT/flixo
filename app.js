var express = require('express');
var path = require('path');
// var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var upload = require('./routes/upload');
var users = require('./routes/users');

var app = express();

var mongoose = require('mongoose');
var pageSchema = require('./models/page').pageSchema;

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
    // console.log('url = ' + req.url);
    // console.log('originalUrl = ' + req.originalUrl);
    // console.log('baseUrl = ' + req.baseUrl);
    var Page = mongoose.model('Page', pageSchema);

    if (req.url === '/')
        Page.find({}).sort('-date').exec(function(err, pages) {
            var titles = new Array();
            var pageUrls = new Array();
            if (err) return err;
            pages.forEach(function(page) {
                titles.push(page.title);
                pageUrls.push('/page/' + page._id);
            });
            res.render('index', {pageUrls: pageUrls});
        });
    else
        next();
});

// app.use('/', index);

// app.use('/page/:', routes);
// app.use('/users', users);

app.get('/page/:pageId', function(req, res, next) {
    var Page = mongoose.model('Page', pageSchema);

    Page.findOne({ '_id': req.params.pageId }, 'title content', function (err, page) {
        if (err) return err;
        res.render('page', {
            css_path: '/stylesheets/greyshade.css',
            marked_page: page.content
        });
    });
});

// app.get('/page/:pageId', function(req, res, next) {
//     // Page.find({ _id: req.params.pageId }, function(err, page) {
//     Page.find({ name: req.params.pageId }, function(err, page) {
//         if (err)
//             throw err;
//         else
//             console.log(page);
//         // res.json(page);
//         res.send(page[0].content);
//     });
//     console.log('find complete');
// });

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

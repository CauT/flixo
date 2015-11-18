var express = require('express');
var path = require('path');
// var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Q = require('q');

var routes = require('./routes/index');
var upload = require('./routes/upload');
var users = require('./routes/users');

var app = express();

var mongoose = require('mongoose');
var Page = require('./models/page').Page;
var Tag = require('./models/tag').Tag;

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

app.get('/tag/:tagName', function(req, res, next) {
    var pageInfos = [];
    var promises = [];
    var tmp;

    var findTagPromise = Tag.findOne({name: req.params.tagName}, 'pages').exec();

    findTagPromise.addBack(function(err, found) {
        tmp = found;
        console.log(found);
        // console.log('1 ' + found);
        // for (var i in found.pages) {
        //     promises.push(Page.find({_id: found.pages[i]}, 'title', function(err, page) {
        //         if (err) return err;
        //         console.log(page);
        //         pageInfos.push({
        //             _id: found.pages[i],
        //             title: page.title
        //         });
        //     }));
        // }
    });

    findTagPromise.then(function() {
        // if (found.length == 1) {
        console.log(tmp);
        var pse = Page.find({_id: tmp.pages[0]}, 'title').exec();
        pse.addBack(function(err, page) {
            if (err) return err;
            console.log(page);
            pageInfos.push({
                _id: tmp.pages[0],
                title: page[0].title
            })
        });
        return pse;
    }).then(function() {
        console.log(pageInfos);
        res.render('index', {
            pages: pageInfos
        });
    });
    // var tmpPromise = findTagPromise;

    // console.log(promises);
    // promises.forEach(function(promise) {
        // tmpPromise = tmpPromise.then(promise);
    // });

    // var a = Tag.findOne({name: req.params.tagName}, 'pages').exec();
    //
    //
    // console.log(a);
    //
    // a.addBack(function(err, found) {
    //     console.log('2 ' + found);
    // });
    //
    // findTagPromise.then(a);
    //
    // tmpPromise.then(function() {
    //     console.log(pageInfos);
    //     res.render('index', {
    //         pages: pageInfos
    //     });
    // });
});

app.get('/page/:pageId', function(req, res, next) {
    Page.findOne({ _id: req.params.pageId }, 'title content tags', function(err, page) {
        if (err) return err;
        // var tagNames = new Array();
        // page.tags.forEach(function(tag) {
        //     tagNames.push(tag.name);
        // });
        res.render('page', {
            // tagNames: tagNames,
            css_path: '/stylesheets/greyshade.css',
            // marked_page: page.content
        });
    });
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

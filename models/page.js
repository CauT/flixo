var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tagSchema = new Schema({
    name: String,
    created_at: Date,
    updated_at: Date
});

var commentSchema = new Schema({
    author: String,
    content: String,
    created_at: Date
    // comment can not be edited
});

var pageSchema = new Schema({
    name: String,
    author: String,
    content: String,
    comments: [commentSchema],
    tags: [tagSchema],
    created_at: Date,
    updated_at: Date
});

var Page = mongoose.model('Page', pageSchema);

module.exports = Page;
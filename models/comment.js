'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
    author: String,
    content: String,
    createdAt: Date
    // comment can not be edited
});

module.exports = {
    Comment: mongoose.model('Comment', commentSchema),
    schema: commentSchema
};

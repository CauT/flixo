'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var commentSchema = require('./comment').schema;
var tagSchema = require('./tag').schema;

var pageSchema = new Schema({
    title: String,
    author: String,
    content: String,
    comments: [commentSchema],
    tags: [ObjectId],
    createdAt: Date,
    updatedAt: Date
});

module.exports = {
    Page: mongoose.model('Page', pageSchema),
    schema: pageSchema
};

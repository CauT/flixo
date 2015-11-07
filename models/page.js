var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = require('./comment').schema;
var tagSchema = require('./tag').schema;

var pageSchema = new Schema({
    name: String,
    author: String,
    content: String,
    comments: [commentSchema],
    tags: [tagSchema],
    created_at: Date,
    updated_at: Date
});

module.exports = {
    Page: mongoose.model('Page', pageSchema),
    schema: pageSchema
};

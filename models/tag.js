'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var tagSchema = new Schema({
    name: String,
    pageNum: Number,
    pages: [ObjectId],
    createdAt: Date,
    updatedAt: Date
});

module.exports = {
    Tag: mongoose.model('Tag', tagSchema),
    schema: tagSchema
};

'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var tagSchema = new Schema({
    name: String,
    pages: [ObjectId],
    created_at: Date,
    updated_at: Date
});

module.exports = {
    Tag: mongoose.model('Tag', tagSchema),
    schema: tagSchema
};

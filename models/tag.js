var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tagSchema = new Schema({
    name: String,
    pages: [String],
    created_at: Date,
    updated_at: Date
});

module.exports = {
    Tag: mongoose.model('Tag', tagSchema),
    schema: tagSchema
};

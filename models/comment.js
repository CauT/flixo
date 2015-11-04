var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
    author: String,
    content: String,
    created_at: Date
    // comment can not be edited
});

var Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
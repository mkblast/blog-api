const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  body: { type: String, required: true },
  author: { type: String, required: true },
  author_id: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  post: {
    type: mongoose.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  }
})

module.exports = mongoose.model("Comment", CommentSchema);

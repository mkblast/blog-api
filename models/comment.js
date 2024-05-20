const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  author: { type: String, required: true },
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

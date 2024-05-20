const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  author: { type: String, required: true },
  published_date: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Post", PostSchema);

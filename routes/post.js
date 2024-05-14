const Router = require("express").Router();
const mongoose = require("mongoose");

const Post = require("../models/post");
const Comment = require("../models/comment");

function validatePostId(req, res, next) {
  const isValid = mongoose.isValidObjectId(req.params.postId);

  if (!isValid) {
    return res.status(400).json({ error: "Bad post ID" });
  }

  next();
}

Router.get("/posts", async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ published_date: -1 }).exec();

    return res.status(200).json(posts);
  } catch (err) {
    return next(err);
  }
});

Router.get("/posts/:postId", validatePostId, async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.postId });

    return res.status(200).json(post);
  } catch (err) {
    return next(err)
  }
});

Router.get("/posts/:postId/comments", validatePostId, async (req, res, next) => {
  try {
    const comments = Comment.find({ post: req.params.postId }).sort({ date: -1 }).exec();

    return res.status(200).json(comments);
  } catch (err) {
    next(err)
  }
})

Router.get("/posts/:postId/comments/:commentId", validatePostId, async (req, res, next) => {
  try {
    const isValidComment = mongoose.isValidObjectId(req.params.commentId);


    if (!isValidComment) {
      return res.status(400).json({ error: "Bad comment ID" });
    }

    const comment = Comment.find({ _id: req.params.commentId, post: req.params.postId }).getFilter()

    res.status(200).json(comment);
  } catch (err) {
    return next(err);
  }
})

module.exports = Router;

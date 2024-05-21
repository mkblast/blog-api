const Router = require("express").Router();
const mongoose = require("mongoose");

const { body, validationResult } = require("express-validator");

const Post = require("../models/post");
const Comment = require("../models/comment");

function validatePostId(req, res, next) {
  const isValid = mongoose.isValidObjectId(req.params.postId);

  if (!isValid) {
    return res.status(404).json({ errors: [{ msg: "Not a valid post ID" }] });
  }

  return next();
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
    const post = await Post.findOne({ _id: req.params.postId }).exec();

    if (!post) {
      return res.status(404).json({ errors: [{ msg: "Post not found" }] });
    }

    return res.status(200).json(post);
  } catch (err) {
    return next(err);
  }
});

Router.get("/posts/:postId/comments", validatePostId, async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.postId }).sort({ date: -1 }).exec();

    return res.status(200).json(comments);
  } catch (err) {
    return next(err);
  }
});

Router.get("/posts/:postId/comments/:commentId", validatePostId, async (req, res, next) => {
  try {
    const isValidComment = mongoose.isValidObjectId(req.params.commentId);


    if (!isValidComment) {
      return res.status(400).json({ errors: [{ msg: "Not a valid comment ID" }] });
    }

    const comment = await Comment.findOne({ _id: req.params.commentId, post: req.params.postId }).exec();

    if (!comment) {
      return res.status(404).json({ errors: [{ msg: "Comment not found" }] });
    }

    res.status(200).json(comment);
  } catch (err) {
    return next(err);
  }
});

Router.post("/posts",
  body("title")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Title must be provided"),

  body("body")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Body must be provided"),

  async (req, res, next) => {
    try {
      if (!req.user.author) {
        return res.status(401).json({ errors: [{ msg: "Not an author" }] });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const post = new Post({
        title: req.body.title,
        body: req.body.body,
        author: `${req.user.first_name} ${req.user.last_name}`,
        published_date: Date.now(),
      });


      await post.save();

      res.status(200).json({ message: "Posted successfully", post });
    } catch (err) {
      return next(err);
    }
  }
);

Router.post("/posts/:postId/comments",
  validatePostId,

  body("body")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Body must be provided"),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const comment = new Comment({
        body: req.body.body,
        author_id: req.user._id,
        author: `${req.user.first_name} ${req.user.last_name}`,
        post: req.params.postId,
        date: Date.now(),
      });

      await comment.save();

      res.status(200).json({ message: "Comment successfully", comment });
    } catch (err) {
      return next(err);
    }
  }
);

Router.put("/posts/:postId",
  validatePostId,
  body("title")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Title must be provided"),

  body("body")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Body must be provided"),

  async (req, res, next) => {
    try {
      if (!req.user.author) {
        return res.status(401).json({ errors: "Not an author" });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const post = await Post.findOne({ _id: req.params.postId }).exec();

      if (!post) {
        return res.status(404).json({ errors: "Post not found" });
      }

      if (!post.author.equals(req.user._id)) {
        return res.status(401).json({ errors: "Not authorized to edit this post" });
      }

      const update = post.updateOne(
        {
          title: req.body.title,
          body: req.body.body,
        },
        { new: true }
      ).getUpdate();

      res.status(200).json({ message: "Posted updated successfully", update });
    } catch (err) {
      return next(err);
    }
  }
);


Router.put("/posts/:postId/comments/:commentId",
  validatePostId,

  body("body")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Body must be provided"),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const comment = await Comment.findOne({
        _id: req.params.commentId,
        post: req.params.postId
      }).exec();

      if (!comment) {
        return res.status(404).json({ errors: "Post not found" });
      }

      if (!comment.author_id.equals(req.user._id)) {
        return res.status(401).json({ errors: [{ msg: "Not authorized to edit this comment" }] });
      }

      const update = comment.updateOne(
        {
          body: req.body.body,
        },
        { new: true }
      ).getUpdate();

      return res.status(200).json({ message: "Posted updated successfully", update });
    } catch (err) {
      return next(err);
    }
  }
);

Router.delete("/posts/:postId", validatePostId, async (req, res, next) => {
  try {
    if (!req.user.author) {
      return res.status(401).json({ errors: [{ msg: "Not an author" }] });
    }

    const post = await Post.findOne({ _id: req.params.postId }).exec();

    if (!post) {
      return res.status(404).json({ errors: [{ msg: "Post not found" }] });
    }

    if (!post.author.equals(req.user._id)) {
      return res.status(401).json({ errors: [{ msg: "Not authorized to delete this post" }] });
    }

    await post.deleteOne()

    return res.status(200).json({ message: "Posted deleted successfully" });
  } catch (err) {
    return next(err);
  }
});

Router.delete("/posts/:postId/comments/:commentId", validatePostId, async (req, res, next) => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.commentId,
      post: req.params.postId
    }).exec();

    if (!comment) {
      return res.status(404).json({ errors: [{ msg: "Post not found" }] });
    }

    if (!comment.author_id.equals(req.user._id)) {
      return res.status(401).json({ errors: [{ msg: "Not authorized to delete this comment" }] });
    }

    await comment.deleteOne();

    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    return next(err);
  }
});

module.exports = Router;

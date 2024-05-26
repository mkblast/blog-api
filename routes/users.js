const Router = require("express").Router();
const User = require("../models/user");

Router.get("/users", async (req, res, next) => {
  try {
    if (!req.user.author) {
      return res.status(401).json({ errors });
    }

    const users = await User.find({}, "-password").exec();

    return res.status(200).json(users);
  } catch (err) {
    next(err);
  }
});

Router.get("/users/me", async (req, res, next) => {
  try {
    const users = await User.findById(req.user._id, "-password").exec();

    return res.status(200).json(users);
  } catch (err) {
    next(err);
  }
});

module.exports = Router;

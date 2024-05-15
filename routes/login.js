const Router = require("express").Router();
const User = require("../models/user");
const bcryptjs = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

Router.post("/login",
  body("email")
    .trim()
    .isLength({ min: 1 })
    .isEmail()
    .withMessage("Must be a valid email"),

  body("password")
    .isLength({ min: 1 })
    .escape()
    .withMessage("Password must not be empty"),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await User.findOne({ email: req.body.email }).exec();

      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const match = await bcryptjs.compare(req.body.password, user.password);

      if (!match) {
        return res.status(401).json({ error: "Password not match" });
      }

      const JWTSecret = process.env.JWT_SECRET;

      const token = jwt.sign(
        { sub: user._id },
        JWTSecret,
        { expiresIn: 60 * 60 * 24 * 30 }
      );


      res.status(200).json({ token });
    } catch (err) {
      next(err)
    }
  }
);

module.exports = Router;

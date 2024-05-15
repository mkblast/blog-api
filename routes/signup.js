const Router = require("express").Router();
const bcryptjs = require("bcryptjs");

const { body, validationResult } = require("express-validator");

const User = require("../models/user");

Router.post("/signup",
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alpahanumeric characters."),

  body("last_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alpahanumeric characters."),

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
      console.log(errors.array())
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const exist = await User.findOne({ email: req.body.email }).exec();
      if (exist) {
        return res.status(400).json({ error: "User already exists" });
      }

      const hashedPassword = await bcryptjs.hash(req.body.password, 10);

      const user = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: hashedPassword,
        author: false,
      });

      await user.save()

      return res.status(200).json({ status: "User registered" });
    } catch (err) {
      return next(err)
    }
  }
);

module.exports = Router;

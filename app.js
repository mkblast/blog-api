const express = require("express");
const mongoose = require("mongoose");
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');

const User = require("./models/user");

require("dotenv").config();

const mongoDB = process.env.MONGODB_URI;

async function main() {
  await mongoose.connect(mongoDB);
}

main().catch(e => console.log(e));

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.json());

const JWTSecret = process.env.JWT_SECRET;

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWTSecret,
}

passport.use(new JwtStrategy(opts, async (jwtPayload, done) => {
  const user = await User.findOne({ _id: jwtPayload.sub }).exec();

  if (user) {
    return done(null, user);
  }

  return done(null, false);
}));

const routes = require("./routes/index");

app.use("/", routes.posts);
app.use("/", routes.signup);
app.use("/", routes.login);

app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json(req.user);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500).json("Server Error");
});

app.listen(3000, () => console.log("server started at port 3000"));

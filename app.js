const express = require("express");
const mongoose = require("mongoose");
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const cors = require("cors")

const User = require("./models/user");

require("dotenv").config();

const mongoDB = process.env.MONGODB_URI;

async function main() {
  await mongoose.connect(mongoDB);
}

main().catch(e => console.log(e));

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.json());

const JWTSecret = process.env.JWT_SECRET;

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWTSecret,
}

passport.use(new JwtStrategy(opts, async (jwtPayload, done) => {
  const user = await User.findOne({ _id: jwtPayload.id }).exec();

  if (user) {
    return done(null, user);
  }

  return done(null, false);
}));

const routes = require("./routes/index");

app.use("/", routes.signup);
app.use("/", routes.login);

function authenticate(req, res, next) {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {

    if (err) return next(err);
    if (!user) return res.status(403).json(info);

    req.user = user;
    next();
  })(req, res, next);
}

app.route('/api/*')
  .post(authenticate)
  .put(authenticate)
  .delete(authenticate);

app.use("/api", routes.posts);


app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500).json("Server Error");
});

app.listen(3000, () => console.log("server started at port 3000"));

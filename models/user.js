const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  author: { type: Schema.Types.Boolean, required: true },
});

module.exports = mongoose.model("User", UserSchema);

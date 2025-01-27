const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: {
    type: String,
    requires: true,
  },
  email: {
    type: String,
    requires: true,
  },
  mobile: {
    type: Number,
    requires: true,
  },
  password: {
    type: String,
    requires: true,
  },
});

module.exports = mongoose.model("User", schema);

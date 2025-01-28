const User = require("../schemas/userSchema.js");
const URL = require("../schemas/shortUrlSchema.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Router = require("express").Router();
const dotenv = require("dotenv");
const { isLoggedIn } = require("../middleware/auth.js");

dotenv.config();

Router.get("/links", isLoggedIn, async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;
  console.log(userId);
  try {
    const urls = await URL.find({ user: userId })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    console.log("urls are", urls);

    const total = await URL.countDocuments({ user: userId });
    res.status(200).json({ urls, total, page, limit });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = Router;

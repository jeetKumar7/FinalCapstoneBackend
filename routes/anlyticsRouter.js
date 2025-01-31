const express = require("express");
const User = require("../schemas/userSchema.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Router = require("express").Router();
const dotenv = require("dotenv");
const { isLoggedIn } = require("../middleware/auth.js");
const Analytics = require("../schemas/analyticsSchema.js");
const device = require("express-device");

dotenv.config();

Router.use(device.capture());

Router.get("/analytics/:shortId", isLoggedIn, async (req, res) => {
  const { shortId } = req.params;
  try {
    const analyticsData = await Analytics.find({ shortUrl: new RegExp(shortId, "i") }).populate(
      "user",
      "username email"
    );
    res.status(200).json(analyticsData);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = Router;

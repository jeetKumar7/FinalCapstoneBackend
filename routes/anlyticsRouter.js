const express = require("express");
const User = require("../schemas/userSchema.js");
const Router = require("express").Router();
const dotenv = require("dotenv");
const { isLoggedIn } = require("../middleware/auth.js");
const Analytics = require("../schemas/analyticsSchema.js");
const device = require("express-device");

dotenv.config();

Router.use(device.capture());

Router.get("/getAnalytics", isLoggedIn, async (req, res) => {
  console.log("Analytics in Router Backend");
  try {
    const analyticsData = await Analytics.find({
      user: req.user.id, // Filter by the logged-in user's ID
    });
    res.status(200).json(analyticsData);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

Router.get("/totalClicks", isLoggedIn, async (req, res) => {
  console.log("Total Clicks in Router Backend");
  try {
    const totalClicks = await Analytics.countDocuments();
    console.log("Total Clicks:", totalClicks);
    res.status(200).json({ totalClicks });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

Router.get("/dateWiseClicks", isLoggedIn, async (req, res) => {
  try {
    const dateWiseClicks = await Analytics.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
      { $limit: 4 },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }, // Sort back to ascending order
    ]);
    res.status(200).json(dateWiseClicks);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

Router.get("/deviceWiseClicks", isLoggedIn, async (req, res) => {
  try {
    const deviceWiseClicks = await Analytics.aggregate([
      {
        $group: {
          _id: "$device",
          count: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(deviceWiseClicks);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = Router;

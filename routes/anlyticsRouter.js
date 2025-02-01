const express = require("express");
const User = require("../schemas/userSchema.js");
const Router = require("express").Router();
const dotenv = require("dotenv");
const { isLoggedIn } = require("../middleware/auth.js");
const Analytics = require("../schemas/analyticsSchema.js");
const device = require("express-device");
const mongoose = require("mongoose");

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
    const userId = req.user.id;
    const totalClicks = await Analytics.countDocuments({ user: userId });
    console.log("Total Clicks:", totalClicks);
    res.status(200).json({ totalClicks });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch total clicks", error });
  }
});

Router.get("/dateWiseClicks", isLoggedIn, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Inside date-wise click backend try block, User ID:", userId);

    const dateWiseClicks = await Analytics.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
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
    ]);

    res.status(200).json(dateWiseClicks);
  } catch (error) {
    console.error("Error in dateWiseClicks:", error);
    res.status(500).json({ message: "Failed to fetch date-wise clicks", error });
  }
});

Router.get("/deviceWiseClicks", isLoggedIn, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Inside device wise click backend try block, User ID:", userId);

    const deviceWiseClicks = await Analytics.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$device",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json(deviceWiseClicks);
  } catch (error) {
    console.error("Error in deviceWiseClicks:", error);
    res.status(500).json({ message: "Failed to fetch device wise clicks", error });
  }
});

module.exports = Router;

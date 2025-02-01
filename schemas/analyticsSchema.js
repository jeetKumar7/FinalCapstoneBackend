const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
  destinationUrl: { type: String, required: true },
  shortUrl: { type: String, required: true },
  ipAddress: { type: String, required: true },
  device: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Analytics", analyticsSchema);

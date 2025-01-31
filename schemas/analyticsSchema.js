const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  destinationUrl: { type: String, required: true },
  shortUrl: { type: String, required: true },
  ipAddress: { type: String, required: true },
  device: { type: String, required: true },
});

module.exports = mongoose.model("Analytics", analyticsSchema);

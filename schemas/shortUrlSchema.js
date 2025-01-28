const mongoose = require("mongoose");

const shortUrlSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the User schema
      ref: "User",
      required: true,
    },
    destinationUrl: {
      type: String,
      required: true,
    },
    remarks: {
      type: String,
      maxlength: 200, // Limit remarks length
      default: "",
    },
    expirationTime: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now, // Automatically set creation date
    },
    hash: {
      type: String,
      required: true,
      unique: true, // Ensure the hash is unique
    },
    clicks: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ShortUrl", shortUrlSchema);

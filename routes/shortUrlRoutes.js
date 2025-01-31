const URL = require("../schemas/shortUrlSchema.js");
const Analytics = require("../schemas/analyticsSchema.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Router = require("express").Router();
const dotenv = require("dotenv");
const { isLoggedIn } = require("../middleware/auth.js");
const device = require("express-device");

dotenv.config();

const generateHash = (url) => {
  return bcrypt.hashSync(url, 10); // Generates hash of the destination URL
};

Router.use(device.capture());

Router.get("/edit/:shortId", isLoggedIn, async (req, res) => {
  const { shortId } = req.params;
  try {
    const shortUrl = await URL.findOne({ hash: shortId });
    if (!shortUrl) {
      return res.status(404).json({ message: "Short URL not found" });
    }
    if (shortUrl.user != req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    res.status(200).json(shortUrl);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

Router.delete("/delete/:shortId", isLoggedIn, async (req, res) => {
  const { shortId } = req.params;
  try {
    console.log("ShortId:", shortId);
    const shortUrl = await URL.findOne({ hash: shortId });
    console.log("Short URL found:", shortUrl);
    if (!shortUrl) {
      return res.status(404).json({ message: "Short URL not found" });
    }
    if (shortUrl.user != req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    await shortUrl.deleteOne({ hash: shortId });

    res.status(200).json({ message: "URL Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error in Backend", error });
  }
});

Router.post("/edit/:shortId", isLoggedIn, async (req, res) => {
  const { shortId } = req.params;
  const { destinationUrl, remarks, expirationTime } = req.body;
  try {
    const shortUrl = await URL.findOne({ hash: shortId });
    if (!shortUrl) {
      return res.status(404).json({ message: "Short URL not found" });
    }
    if (shortUrl.user != req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (destinationUrl) {
      shortUrl.destinationUrl = destinationUrl;
    }
    if (remarks) {
      shortUrl.remarks = remarks;
    }
    if (expirationTime) {
      shortUrl.expirationTime = expirationTime;
    }
    await shortUrl.save();
    res.status(200).json({ message: "URL Updated Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

Router.post("/shorten", isLoggedIn, async (req, res) => {
  const { destinationUrl, remarks, expirationTime } = req.body;
  try {
    // Hash the destination URL using bcrypt and truncate the hash
    const urlHash = generateHash(destinationUrl); // Truncated to 8 chars
    const shortUrlId = urlHash.substring(0, 8);

    // Save the new shortened URL to the database
    const newShortUrl = new URL({
      user: req.user.id, // From decoded JWT
      destinationUrl,
      remarks: remarks || "",
      expirationTime: expirationTime || null,
      hash: shortUrlId,
      clicks: 0,
    });

    await newShortUrl.save();

    // Backend URL for the shortened URL

    const shortUrl = `http://localhost:2000/api/url/${shortUrlId}`;
    console.log(`Hashed Value before is ${urlHash} and after is ${shortUrlId} and the URL is ${shortUrl}`);
    res.status(200).json({ message: "URL Shortened Successfully", shortUrl });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

Router.get("/:shortId", async (req, res) => {
  const { shortId } = req.params; // Get the hashed part of the URL from the route
  console.log("ShortId received:", shortId);
  try {
    // Find the original URL using the hashed value (truncated hash from the database)
    const shortUrl = await URL.findOne({ hash: shortId });
    console.log("Short URL found:", shortUrl);

    // If the URL is not found in the database
    if (!shortUrl) {
      return res.status(404).json({ message: "Short URL not found" });
    }
    if (shortUrl.expirationTime && new Date() > shortUrl.expirationTime) {
      return res.status(410).json({ message: "Short URL has expired" });
    }

    shortUrl.clicks += 1;
    await shortUrl.save();

    const analyticsData = new Analytics({
      destinationUrl: shortUrl.destinationUrl,
      shortUrl: shortUrl.hash,
      ipAddress: req.ip,
      device: req.device.type,
      user: shortUrl.user,
    });
    await analyticsData.save();

    // await Click.create({
    //   url: shortUrl._id,
    //   ip: req.ip,
    //   userAgent: req.headers["user-agent"],
    // });

    // shortUrl.clicks += 1;
    // await shortUrl.save();

    // Redirect to the original destination URL
    return res.redirect(shortUrl.destinationUrl);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = Router;

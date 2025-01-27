const URL = require("../schemas/shortUrlSchema.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Router = require("express").Router();
const dotenv = require("dotenv");
const { isLoggedIn } = require("../middleware/auth.js");

dotenv.config();

const generateHash = (url) => {
  return bcrypt.hashSync(url, 10); // Generates hash of the destination URL
};

Router.post("/shorten", isLoggedIn, async (req, res) => {
  const { destinationUrl, remarks, expirationTime } = req.body;
  const userId = req.user.id;
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

    // Redirect to the original destination URL
    return res.redirect(shortUrl.destinationUrl);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = Router;

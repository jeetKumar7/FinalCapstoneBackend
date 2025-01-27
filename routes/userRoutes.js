const User = require("../schemas/userSchema.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Router = require("express").Router();
const dotenv = require("dotenv");

dotenv.config();

Router.post("/signup", async (req, res) => {
  const { name, email, mobile, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User Already Exist" });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ email, password: hashedPassword, name, mobile });
      await newUser.save();
      const token = jwt.sign({ name }, process.env.JWT_SECRET);
      res.status(200).json({ message: "User Created SUccesfully!", token, id: newUser._id });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
    // console.log("Error", error);
  }
});

Router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      res.status(400).json({ message: "Invalid Credentials" });
      return;
    }
    const token = jwt.sign({ email }, process.env.JWT_SECRET);
    res.status(200).json({ message: "Signin Succesfull", token, id: user._id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = Router;

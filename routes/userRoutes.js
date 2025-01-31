const User = require("../schemas/userSchema.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Router = require("express").Router();
const dotenv = require("dotenv");
const { isLoggedIn } = require("../middleware/auth.js");

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
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
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
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(200).json({ message: "Signin Succesfull", token, id: user._id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

Router.put("/edit", isLoggedIn, async (req, res) => {
  const { name, email, mobile } = req.body;
  const userId = req.user.id;
  // console.log(userId);
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, { name, email, mobile }, { new: true });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

Router.delete("/delete", isLoggedIn, async (req, res) => {
  const userId = req.user.id;
  console.log(userId);
  try {
    await User.findByIdAndDelete(userId);
    await User.deleteMany({ user: userId });
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

Router.get("/getuser", isLoggedIn, async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = Router;

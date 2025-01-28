const express = require("express");
const userRouter = require("./routes/userRoutes");
const dashboardRouter = require("./routes/dashboardRoutes.js");
const shortUrl = require("./routes/shortUrlRoutes");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(`Error connecting DB ${err}`);
  });

app.get("/", (req, res) => {
  res.send("API Working Fine!");
});

app.listen(PORT, () => {
  console.log(`App is running on PORT ${PORT}`);
});

app.use("/api/user", userRouter);
app.use("/api/url", shortUrl);
app.use("/dashboard", dashboardRouter);

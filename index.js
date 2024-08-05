const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

const PORT = process.env.PORT || 8001;

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/EMPLOYEE", {});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  Id: { type: Number, required: true, unique: true },
  age: { type: Number, required: true },
  DOJ: { type: String, required: true },
  Salary: { type: Number, required: true },
  Email: { type: String, required: true },
  Department: { type: String, required: true },
  Post: { type: String, required: true },
});

// Custom collection name
const User = mongoose.model("User", userSchema, "EMPLOYEE");

// Serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Serve register.html
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

// Serve home.html
app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

// Register route
app.post("/register", async (req, res) => {
  const { username, password, Id, age, DOJ, Salary, Email, Department, Post } =
    req.body;

  // Log request body for debugging
  console.log("Register Request body:", req.body);

  // Validate request body
  if (
    !username ||
    !password ||
    !Id ||
    !age ||
    !DOJ ||
    !Salary ||
    !Email ||
    !Department ||
    !Post
  ) {
    return res.status(400).send("Missing required fields");
  }

  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      username,
      password: hashedPassword,
      Id,
      age,
      DOJ,
      Salary,
      Email,
      Department,
      Post,
    });

    // Save the new user
    await newUser.save();
    res.status(201).send("User registered");
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(400).send("Error registering user");
  }
});

// Login route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Log request body for debugging
  console.log("Login Request body:", req.body);

  // Validate request body
  if (!username || !password) {
    return res.status(400).send("Missing required fields");
  }

  try {
    // Find the user
    const user = await User.findOne({ username });
    if (!user) return res.status(400).send("Invalid credentials");

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Invalid credentials");

    // Send user details upon successful login
    res.status(200).json({
      username: user.username,
      Id: user.Id,
      age: user.age,
      DOJ: user.DOJ,
      Salary: user.Salary,
      Email: user.Email,
      Department: user.Department,
      Post: user.Post,
    });
  } catch (error) {
    res.status(500).send("Server error");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

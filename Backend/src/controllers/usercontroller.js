console.log("!!! DEBUG: I AM EDITING THE CORRECT MIDDLEWARE FILE !!!");   
const User = require("../models/usermodel");
const jwt = require("jsonwebtoken");
const { client: redisClient, connectRedis } = require('../config/redisclient');
const SECRET = "mysecretkey";


const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Logic to save user to MongoDB (I added the missing logic for you)
    const newUser = await User.create({ email, password });

    // 2. Send the response (This ENDS the request)
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser
    });

  } catch (error) {
    // If an error happens, it goes here
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    // Normalize email: trim spaces and lowercase it
    const email = req.body.email.trim().toLowerCase();
    const { password } = req.body;

  
    // 1. Find user
    const user = await User.findOne({ email });

    if (!user) {
      // This is the specific reason for failure
      console.log(`[LOGIN FAILED] No user found in DB with email: ${email}`);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    console.log(`[LOGIN SUCCESS] User found: ${user.email}. Checking password...`);

    // 2. Check password
    const isMatch = await user.matchPassword(password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id, email: user.email }, SECRET, { expiresIn: "1h" });

      // --- REDIS CACHE LOGIC START ---
      await connectRedis(); // Ensure connection
      // Store user data in Redis for 1 hour (3600 seconds)
      // We use a key like 'user:session:ID'
      await redisClient.setEx(
        `user:session:${user._id}`, 
        3600, 
        JSON.stringify({ id: user._id, email: user.email, role: 'user' })
      );
      console.log(`🚀 User session cached in Redis for: ${user.email}`);
      // --- REDIS CACHE LOGIC END ---

      res.json({
        success: true,
        message: "Login successful",
        token,
        userId: user._id,
      });
    }
  } catch (error) {
    console.error("[LOGIN ERROR] System Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


module.exports = {
  registerUser,
  loginUser,
};
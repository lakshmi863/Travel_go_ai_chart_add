console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
console.log("!!! THE SERVER IS FINALLY READING THE CORRECT FILE !!!");
console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
const jwt = require('jsonwebtoken');
const SECRET = 'mysecretkey';
const { client: redisClient, connectRedis } = require('../config/redisclient');
// 1. Added 'next' to the arguments here 
const validateRegistration = (req, res, next) => { 
   console.log("BODY RECEIVED:", req.body); 
  const { email, password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }
  
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ 
        message: "Password must be 8+ chars, include one uppercase, one number, and one special character"
    });
  }

  next(); // This will now work
};

// 2. Added 'next' to the arguments here 
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Access denied." });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET);

    // --- REDIS CACHE CHECK START ---
    await connectRedis();
    const cachedUser = await redisClient.get(`user:session:${decoded.id}`);

    if (cachedUser) {
      console.log("⚡ Auth Cache Hit! Using Redis data.");
      req.user = JSON.parse(cachedUser); // Use Redis data (super fast)
    } else {
      console.log("🐢 Auth Cache Miss. Checking Database...");
      // If not in Redis, you could fetch from DB here, or just let the next 
      // controller handle it. For performance, we attach the decoded info.
      req.user = decoded; 
    }
    // --- REDIS CACHE CHECK END ---

    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid token." });
  }
};
module.exports = { validateRegistration, verifyToken };
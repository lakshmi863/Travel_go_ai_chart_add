// 1. MUST BE FIRST: Load Environment Variables
require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// 2. Route & Model Imports
const userRouter = require('./src/routers/userrouter'); 
const activityRouter = require('./src/routers/activityrouter');
const aiRoutes = require('./src/routers/airoutes');
const hotelRouter = require('./src/routers/hotelrouter');

// 3. Utility Imports
const { connectRedis } = require('./src/config/redisclient');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Redis Connection
connectRedis().catch(err => console.error("❌ Redis connection failed on startup:", err));

// ---------------------------------------------------------
// SECURITY: THREE-TIER RATE LIMITERS
// ---------------------------------------------------------

/**
 * TIER 1: GENERAL API LIMITER
 * Protects the server from DDoS/Spam while allowing normal browsing.
 * Allows 100 requests every 15 minutes.
 */
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, 
    message: { error: "Too many requests from this IP, please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * TIER 2: AUTH LIMITER
 * Protects Login and Registration from brute-force attacks.
 * Limit: 15 attempts per hour.
 */
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 15, 
    message: { error: "Too many login attempts. Please try again in 1 hour." },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * TIER 3: BOOKING/SENSITIVE LIMITER
 * Protects actual transactions and bookings.
 * Limit: 5 attempts per 15 minutes.
 */
const bookingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, 
    message: { error: "Too many booking attempts. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

// ---------------------------------------------------------
// MIDDLEWARE
// ---------------------------------------------------------
app.use(helmet()); 
app.use(cors({
    origin: ["http://localhost:3000", "https://travelgo-front.onrender.com"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
app.use(express.json()); 

// Apply the General Limiter to ALL /api routes to prevent general abuse
app.use('/api', generalLimiter);

// ---------------------------------------------------------
// DATABASE CONNECTION
// ---------------------------------------------------------
const MONGO_URI = process.env.MONGO_URI;
if (MONGO_URI) {
    mongoose.connect(MONGO_URI)
      .then(() => console.log('✅ Connected to MongoDB Atlas'))
      .catch(err => console.error('❌ MongoDB Connection Error:', err.message));
} else {
    console.error("❌ ERROR: MONGO_URI is not defined in environment variables!");
}

// ---------------------------------------------------------
// ROUTES
// ---------------------------------------------------------

// 1. Auth Routes: Uses BOTH General Limiter AND Auth Limiter
app.use('/api/auth', authLimiter, userRouter);

// 2. Activity Routes: Uses General Limiter (defined above)
app.use('/api/activities', activityRouter);

// 3. Hotel Routes: 
// CRITICAL FIX: We do NOT apply bookingLimiter here anymore.
// We only apply the generalLimiter (which was applied via app.use('/api', ...)).
// You will apply the bookingLimiter ONLY to the POST /book route inside hotelRouter.js.
app.use('/api/hotels', hotelRouter); 

// 4. AI Routes: Uses General Limiter
app.use('/api/ai', aiRoutes);

// ---------------------------------------------------------
// SERVER INITIALIZATION
// ---------------------------------------------------------
app.get('/', (req, res) => {
    res.status(200).send("TravelGo Production Backend is Online!");
});

app.listen(PORT, () => {
  console.log(`🚀 TravelGo Server is squared and running on port ${PORT}`);
});
const express = require('express');
const router = express.Router();
const {
    addHotel,
    getHotelsByCity,
    getSingleHotel,
    bookHotel, // This is the one we want to protect
    getMyBookings,
    getAllHotels
} = require('../controllers/hotelcontroller');

// Note: In a real app, you'd import a limiter middleware here. 
// For a quick fix, we assume you might want to add the logic here 
// or move the bookingLimiter from index.js to this file.

router.get('/', getAllHotels); // NO LIMITER - Anyone can browse
router.post('/add-hotel', addHotel);
router.get('/hotels/:city', getHotelsByCity);
router.get('/hotel/:id', getSingleHotel);

// APPLY LIMITER ONLY TO THE BOOKING ACTION
// If you moved bookingLimiter to a middleware file, use it here:
// router.post('/book', bookingLimiter, bookHotel); 
router.post('/book', bookHotel); 

router.get('/my-bookings/:email', getMyBookings);

module.exports = router;
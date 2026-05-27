const Hotel = require('../models/hotelmodel');
const HotelBooking = require('../models/hotelbookingmodel');

const sendHotelConfirmation = require('../utils/hotelemail');



/*
========================================
ADD HOTEL
========================================
*/

const addHotel = async (req, res) => {

    try {

        const hotel = new Hotel(req.body);

        await hotel.save();

        res.status(201).json({
            success: true,
            message: 'Hotel Added Successfully',
            hotel
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            error: error.message
        });

    }

};



/*
========================================
GET HOTELS BY CITY
========================================
*/

const getHotelsByCity = async (req, res) => {

    try {

        const hotels = await Hotel.find({
            city: req.params.city
        });

        res.status(200).json({
            success: true,
            hotels
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            error: error.message
        });

    }

};



/*
========================================
GET SINGLE HOTEL
========================================
*/

const getSingleHotel = async (req, res) => {

    try {

        const hotel = await Hotel.findById(req.params.id);

        if (!hotel) {

            return res.status(404).json({
                success: false,
                message: 'Hotel Not Found'
            });

        }

        res.status(200).json({
            success: true,
            hotel
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            error: error.message
        });

    }

};



/*
========================================
BOOK HOTEL
========================================
*/

const bookHotel = async (req, res) => {

    try {

        const booking = new HotelBooking(req.body);

        const savedBooking = await booking.save();

        try {

            await sendHotelConfirmation(savedBooking);

        } catch (emailError) {

            console.error('📧 Email Error:', emailError.message);

        }

        res.status(201).json({
            success: true,
            message: 'Hotel Booked Successfully',
            booking: savedBooking
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            error: error.message
        });

    }

};



/*
========================================
GET USER BOOKINGS
========================================
*/

const getMyBookings = async (req, res) => {

    try {

        const bookings = await HotelBooking.find({
            passengerEmail: req.params.email
        })
        .populate('hotel')
        .sort({ bookedAt: -1 });

        res.status(200).json({
            success: true,
            bookings
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            error: error.message
        });

    }

};

const getAllHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find(); // Finds everything in the collection
        res.status(200).json({
            success: true,
            hotels
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {

    addHotel,
    getHotelsByCity,
    getSingleHotel,
    bookHotel,
    getMyBookings,
    getAllHotels

};
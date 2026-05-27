const mongoose = require('mongoose');

const hotelBookingSchema = new mongoose.Schema({

    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
    },

    passengerName: {
        type: String,
        required: true
    },

    passengerEmail: {
        type: String,
        required: true
    },

    checkIn: {
        type: Date,
        required: true
    },

    checkOut: {
        type: Date,
        required: true
    },

    totalPrice: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        default: 'CONFIRMED'
    },

    bookedAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model('HotelBooking', hotelBookingSchema);
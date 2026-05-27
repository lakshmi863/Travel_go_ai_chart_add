const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({

    hotelName: {
        type: String,
        required: true
    },

    city: {
        type: String,
        required: true
    },

    address: String,

    rating: {
        type: Number,
        default: 4.5
    },

    pricePerNight: Number,

    amenities: {
        type: [String],
        default: []
    },

    images: {
        type: [String],
        default: []
    }

}, { timestamps: true });

module.exports = mongoose.model('Hotel', hotelSchema);
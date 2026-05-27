const Hotel = require('../models/hotelmodel');

const getHotelsFromDB = async ({ location, budget, hotelName }) => {
  let query = {};

  // 1. If a specific hotel name is provided (e.g., "Zibe"), search by name
  if (hotelName) {
    query.hotelName = { $regex: hotelName, $options: 'i' };
  } 
  // 2. Otherwise, search by city if provided
  else if (location) {
    query.city = { $regex: location, $options: 'i' };
  }

  // 3. Always apply budget filter if provided
  if (budget && budget > 0) {
    query.pricePerNight = { $lte: budget };
  }

  return await Hotel.find(query).limit(10);
};

module.exports = { getHotelsFromDB };
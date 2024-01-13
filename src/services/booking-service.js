const axios = require('axios');
const { BookingRepository } = require('../repositories');
const db = require('../models');
const { FLIGHT_SERVICE } = require('../config/server-config');

const bookingRepository = new BookingRepository();

async function createBooking(data){
    console.log(data);
    try {
        const result = db.sequelize.transaction(async function bookingImpl(t){
            const flight = await axios.get(`${FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`);
            console.log(flight.data);
            return true;
        })
    } catch (error) {
        
    }
}

module.exports = {
    createBooking
    
}
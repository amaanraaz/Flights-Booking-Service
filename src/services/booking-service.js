const axios = require('axios');
const { BookingRepository } = require('../repositories');
const db = require('../models');
const { FLIGHT_SERVICE } = require('../config/server-config');
const bookingRepository = new BookingRepository();
const AppError = require('../utils/error/app-error');
const { StatusCodes } = require('http-status-codes');

async function createBooking(data){
    const transaction = await db.sequelize.transaction();
    try {
            const flight = await axios.get(`${FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`);
            const flightData = flight.data.data;
            if(data.noOfSeats>flightData.totalSeats){
                throw new AppError('Not enough seats available', StatusCodes.BAD_REQUEST);
            }
            const totalBookingAmount = data.noOfSeats * flightData.price;
            const bookingPayload = {
                ...data,
                totalCost: totalBookingAmount
            };
            console.log("hello", bookingPayload);
            const booking = await bookingRepository.createBooking(bookingPayload,transaction);
            // console.log(booking);
            await axios.patch(`${FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`,{
                seats: data.noOfSeats
            })

            await transaction.commit();
            return true;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

module.exports = {
    createBooking
    
}
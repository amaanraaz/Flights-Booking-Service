const axios = require('axios');
const { BookingRepository } = require('../repositories');
const db = require('../models');
const { FLIGHT_SERVICE } = require('../config/server-config');
const bookingRepository = new BookingRepository();
const AppError = require('../utils/error/app-error');
const { StatusCodes } = require('http-status-codes');
const { Enums } = require('../utils/common');
const {BOOKED,CANCELLED} = Enums.BOOKING_STATUS

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
            return booking;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

async function makePayment(data){
    const transaction = await db.sequelize.transaction();
    try {
        const bookingDetails = await bookingRepository.get(data.bookingId,transaction);
        const bookingTime = new Date(bookingDetails.createdAt);
        const currentTime = new Date();
        const cmpTime = (currentTime.valueOf()-bookingTime.valueOf())/60000;
        if(cmpTime > 20){
            await cancelBooking(data.bookingId);
            throw new AppError('The booking has been cancelled due to time limit', StatusCodes.BAD_REQUEST);
        }
        if(bookingDetails.totalCost!= data.totalCost){
            throw new AppError('The amount of the payment doesnt match',StatusCodes.BAD_REQUEST);
        }
        if(bookingDetails.userId!= data.userId){
            throw new AppError('The user corresponding to booking doesnt match',StatusCodes.BAD_REQUEST);
        }
        //assuming payment is complete
        await bookingRepository.update(data.bookingId, {status: BOOKED}, transaction);
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }

}
async function cancelBooking(bookingId){
    const transaction = await db.sequelize.transaction();
    try {
        const bookingDetails = await bookingRepository.get(bookingId,transaction);
        if(bookingDetails.status == CANCELLED){
            await transaction.commit();
            return true;
        }
        await axios.patch(`${FLIGHT_SERVICE}/api/v1/flights/${bookingDetails.flightId}/seats`,{
            seats: bookingDetails.noOfSeats,
            dec: "true"
        });
        await bookingRepository.update(bookingId, {status: CANCELLED}, transaction);
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

module.exports = {
    createBooking,
    makePayment
    
}
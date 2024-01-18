const {StatusCodes} = require('http-status-codes')
const {BookingService} = require('../services');
const { SuccessResponse, ErrorResponse } = require('../utils/common');

// creating a space in memory for just storing idempotency keys or one can use a new table in db
const inMemDb = {};

async function createBooking(req,res){
    try {
        const response = await BookingService.createBooking({
            flightId: req.body.flightId,
            noOfSeats: req.body.noOfSeats,
            userId: req.body.userId
    })
    SuccessResponse.data = response;
        return res
                .status(StatusCodes.OK)
                .json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json(ErrorResponse);
    }
}

async function makePayment(req,res){
    try {
        const idempotencyKey = req.headers['idempotency-key'];
        if(!idempotencyKey){
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({message:'idempotency key needed'});
        }
        if(inMemDb[idempotencyKey]){
            return res
            .status(StatusCodes.BAD_REQUEST)
            .json({message:'Payment already done'});
        }
        const response = await BookingService.makePayment({
            totalCost: req.body.totalCost,
            userId: req.body.userId,
            bookingId: req.body.bookingId
    });
    inMemDb[idempotencyKey] = idempotencyKey;
    SuccessResponse.data = response;
        return res
                .status(StatusCodes.OK)
                .json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json(ErrorResponse);
    }
}

module.exports = {
    createBooking,
    makePayment
}
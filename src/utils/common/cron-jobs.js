const cron = require('node-cron');

const {BookingService} = require('../../services')

function scheduleCrons(){
    cron.schedule('*/20 * * * *', async() => {
        console.log('running a task every 5 sec');
        const res = await BookingService.cancelOldBooking();
    });
}

module.exports = scheduleCrons;

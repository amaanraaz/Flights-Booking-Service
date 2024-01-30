const express = require('express');

const { ServerConfig } = require('./config');
const apiRoutes = require('./routes');

const CRON = require('./utils/common/cron-jobs');
const amqplib = require('amqplib')

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/api', apiRoutes);
// app.use('/bookingService/api', apiRoutes); // just for proxy allow nor required now

//rabbit mq implementation
async function connectQueue(){
    try {
        const connection = await amqplib.connect("amqp://localhost");
        const channel = await connection.createChannel();
        await channel.assertQueue("notification-queue");
        await channel.sendToQueue("notification-queue", Buffer.from("this is a test msg 1"));  //publishing to queue
    } catch (error) {
        console.log(error);
        throw error;
    }
}

app.listen(ServerConfig.PORT, async () => {
    console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);
    CRON();
    await connectQueue();
    console.log("QUeue connected");

});

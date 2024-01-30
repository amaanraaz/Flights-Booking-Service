const amqplib = require('amqplib');

let channel,connection
//rabbit mq implementation
async function connectQueue(){
    try {
        connection = await amqplib.connect("amqp://localhost");
        channel = await connection.createChannel();
        await channel.assertQueue("notification-queue");
        // await channel.sendToQueue("notification-queue", Buffer.from("this is a test msg 1"));  //publishing to queue
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function sendData(data){
    try {
        channel.sendToQueue("notification-queue",Buffer.from(JSON.stringify(data)));
    } catch (error) {
        throw error;
    }
}

module.exports = {
    connectQueue,
    sendData
}
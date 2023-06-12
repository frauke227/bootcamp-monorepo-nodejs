#!/usr/bin/env node

var amqp = require('amqplib/callback_api')

// will create connection inside main.ts
amqp.connect('amqp://localhost', function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }

        var queue = 'hello';
        // adjust message to send the review

        // call the send/ receive files in application somehow
        var msg = 'Hello World!';

        // this becomes a function that also calculated the avegare

        // ourImportedFunction(()=>{
            // msg = calculateAverage()
            //channel.sendToQueue(Buffer.from(msg));
        // })
        channel.assertQueue(queue, {
            durable: false
        });
        channel.sendToQueue(queue, Buffer.from(msg));

        console.log(" [x] Sent %s", msg);
    });
    setTimeout(function() {
        connection.close();
        process.exit(0);
    }, 500);
})

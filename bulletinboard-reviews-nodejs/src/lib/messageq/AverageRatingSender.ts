#!/usr/bin/env node
import amqp = require('amqplib/callback_api')
// import amqp from 'amqplib/callback_api'

export default class AverageRatingSender {
  private channel: amqp.Channel
  private connection: amqp.Connection

  constructor(channel: amqp.Channel, connection: amqp.Connection) {
    this.channel = channel
    this.connection = connection
  }

  async sendAverageRating(averageRating: number, revieweeEmail: string) {
      const queue = 'averageRatingQueue'
      const sendObject = { averageRating, revieweeEmail}
      const msg = JSON.stringify(sendObject)
      this.channel.assertQueue(queue, {
        durable: false
         });
      this.channel.sendToQueue(queue, Buffer.from(msg));

      console.log(' [x] Sent %s', msg);
  }

  async closeTheConnection (){
    this.connection.close()
  }
}


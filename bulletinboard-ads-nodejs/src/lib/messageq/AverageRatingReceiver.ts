import ReviewStorage from '../storage/review-storage.js'
import amqp = require('amqplib/callback_api')
// import amqp from 'amqplib/callback_api'
import { ReviewPaylaod } from '../validation/validate.js'

export default class AverageRatingReceiver {
  private channel: amqp.Channel
  private queue: string
  private reviewStorage: ReviewStorage

  constructor(channel: amqp.Channel, reviewStorage: ReviewStorage ) {
    this.channel = channel
    this.queue = 'averageRatingQueue'
    this.reviewStorage = reviewStorage
  }


  async consumeQueue(msg: any){
      // let messageContent: ReviewPaylaod
      this.channel.assertQueue(this.queue, {
        durable: false
      });
      // const messageContent = async (): Promise<ReviewPaylaod> => {
      //   let message: ReviewPaylaod

        // this.channel.consume(this.queue, (msg) => {
          const messageStringified = JSON.stringify(msg?.content)
          const messageToSend = JSON.parse(messageStringified)
          console.log(' [x] Received %s', messageToSend);
          // how to pass from review-storage
          this.reviewStorage.updateAverageRating(messageToSend)
        //   }, {
        //       noAck: true
        //   });
        }

  // async updateDataBase(message: ReviewPaylaod){
  //   this.storage.updateAverageRating(message)
  // }
  // const updateRating = ()=> {
  //   const message = this.consumeQueue()
  //   this.storage.updateAverageRating(message)
  // }
  // async sendAverageRating(averageRating: number) {
  //     const queue = 'averageRatingQueue'
  //     const msg = averageRating.toString()
  //     this.channel.assertQueue(queue, {
  //       durable: false
  //        });
  //     this.channel.sendToQueue(queue, Buffer.from(msg));

  //     console.log(' [x] Sent %s', msg);
  // }

}


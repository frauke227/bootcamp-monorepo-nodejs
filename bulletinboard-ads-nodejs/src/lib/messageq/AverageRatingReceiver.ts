import ReviewStorage from '../storage/review-storage.js'
import { Logger } from 'winston'
export default class AverageRatingReceiver {
  private reviewStorage: ReviewStorage
  private logger: Logger

  constructor( reviewStorage: ReviewStorage, logger: Logger ) {
    this.reviewStorage = reviewStorage
    this.logger = logger.child({ module: 'message-receiver' })
  }


  async consumeQueue(msg: any){
          const stringified = msg.content.toString()
          const messageToSend = JSON.parse(stringified)
          this.logger.debug('from consumeQueue [x] Received messageToSend %s', messageToSend);
          this.reviewStorage.createAverageRating(messageToSend)
        }
}


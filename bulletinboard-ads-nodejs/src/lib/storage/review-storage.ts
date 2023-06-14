import PostgresAdStorage from './postgres-ad-storage.js'
import { Pool } from 'pg'
import { Logger } from 'winston'
import util from 'util'
import { ReviewPaylaod } from '../validation/validate.js'


//do we need to pass it or is it automatically passed then(test if we can call teh function from storage)
export default class ReviewStorage extends PostgresAdStorage {

    static REVIEW_EXISTS = 'SELECT EXISTS(SELECT 1 FROM reviews WHERE contact=$1)'
    static REVIEW_CREATE = 'INSERT INTO reviews (contact, review) VALUES ($1, $2) RETURNING contact'
    static REVIEW_UPDATE = 'UPDATE reviews SET (contact, review) = ($1, $2) WHERE contact = $1'
    static REVIEW_DELETE = 'DELETE FROM reviews WHERE contact = $1'
    static REVIEW_DELETE_ALL = 'DELETE FROM reviews'

    constructor(pool: Pool, logger: Logger) {
        super(pool, logger)
        this.logger = logger.child({ module: 'review-storage' })
        this.pool.on('error', ({ message }) => {
          this.logger.error('Error raised by review-storage on client: %s', message)
        })
      }

    private async checkRatingExists(contact: string) {
        this.logger.debug('Checking contact: %s', contact)
        const resp = await this.pool.query<{ exists: boolean }>(ReviewStorage.REVIEW_EXISTS, [contact])
        const { rows: [{ exists }] } = resp
        if (!exists) {
          const message = util.format('No review found for contact: %s', contact)
          console.log('Entry doesnt exsist', message)
        //   throw new NotFoundError(message)
        }
        return exists
      }

    async updateAverageRating(messageContent: ReviewPaylaod){
        try {
            const {revieweeEmail, averageRating } = messageContent
            this.logger.debug('Updating rating with contact: %s', revieweeEmail)
            await this.pool.query(ReviewStorage.REVIEW_UPDATE, [revieweeEmail, averageRating])
            this.logger.debug('Successfully updated rating with contact: %s with update: %O', revieweeEmail, messageContent)
          } catch (error) {
            const { message } = error as Error
            this.logger.error('Error updating rating', message)
            throw error
          }
      }

    async createAverageRating({revieweeEmail, averageRating }: ReviewPaylaod) {
        try {
            const contactExists = await this.checkRatingExists(revieweeEmail)
            if(contactExists){
                this.logger.debug('Updating rating since contact exsists: %O', { revieweeEmail, averageRating })
                this.updateAverageRating({revieweeEmail, averageRating })
            }else {
                this.logger.debug('Creating rating : %O', { revieweeEmail, averageRating })
                const response = await this.pool.query(ReviewStorage.REVIEW_CREATE, [revieweeEmail, averageRating ])
                this.logger.debug('Successfully created rating: %O', { revieweeEmail, averageRating })
                return response
            }
        } catch (error) {
          const { message } = error as Error
          this.logger.error('Error creating rating', message)
          throw error
        }
      }


    //   async delete(id: number) {
    //     try {
    //       this.logger.debug('Deleting ad with id: %s', id)
    //       await this.checkExists(id)
    //       await this.pool.query(PostgresAdStorage.DELETE, [id])
    //       this.logger.debug('Successfully deleted ad with id: %s', id)
    //     } catch (error) {
    //       const { message } = error as Error
    //       this.logger.error('Error deleting ad with id: %s - %s', id, message)
    //       throw error
    //     }
    //   }

    //   async deleteAll() {
    //     try {
    //       this.logger.debug('Deleting all ads')
    //       await this.pool.query(PostgresAdStorage.DELETE_ALL)
    //       this.logger.debug('Successfully deleted all ads')
    //     } catch (error) {
    //       const { message } = error as Error
    //       this.logger.error('Error deleting all ads - %s', message)
    //       throw new Error(message)
    //     }
    //   }
}

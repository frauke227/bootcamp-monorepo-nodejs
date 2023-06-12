import { Logger } from 'winston'
import nodeFetch from 'node-fetch'

export default class ReviewsClient {
  private logger: Logger

  constructor(private fetch: typeof nodeFetch, private endpoint: string, logger: Logger) {
    this.logger = logger.child({ module: 'reviews-client' })
  }

  getEndpoint() {
    return this.endpoint
  }
//will be replaced by MessageQ
  async getAverageRating(contact: string) {
    this.logger.debug('Getting average rating for contact: %s', contact)
    const response = await this.fetch(`${this.endpoint}/api/v1/averageRatings/${contact}`)
    const { averageRating } = (await response.json()) as { averageRating: number }
    this.logger.debug('Successfully got average rating for contact: %s - %d', contact, averageRating)
    return averageRating
  }
}

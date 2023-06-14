// import fetch from 'node-fetch'
import pg from 'pg'
import PostgresAdStorage from './storage/postgres-ad-storage.js'
import ReviewStorage from './storage/review-storage.js'
import logger from './util/logger.js'
import application from './application.js'
import migrate from './storage/migrate-api.js'
// import { ReviewPaylaod } from '../lib/validation/validate.js'
import rabbitMqConnection from '../lib/messageq/rabbitMqConnection.js'
import AverageRatingReceiver from '../lib/messageq/AverageRatingReceiver.js'

export type Config = {
  app: {
    port: number
  },
  postgres: {
    connectionString: string
  },
  reviews: {
    endpoint: string
  }
}

export default async function main(config: Config) {
  const { app: { port }, postgres, reviews: { endpoint } } = config

  const log = logger.child({ module: 'server' })

  //set the queue up as a connection config
  const queue = 'averageRatingQueue'
  await migrate(postgres).up()
  const pool = new pg.Pool(postgres)
  const storage = new PostgresAdStorage(pool, logger)
  const reviewStorage = new ReviewStorage(pool, logger)

  // TODO: get rid of the reviewsClient
  // const reviewsClient = new ReviewsClient(fetch, endpoint, logger)
  const { channel, connection } = await rabbitMqConnection()

  channel.consume(queue, (msg: any) => {
    log.debug('from consume channel message:', msg)
    new AverageRatingReceiver(reviewStorage, logger).consumeQueue(msg)
  })

  const app = application(storage, logger, endpoint)

  app
    .listen(port, () => log.info('Server is listening on http://localhost:%d', port))
    .on('error', ({ message }) => log.error('Error starting server: %s', message))

  const shutdown = () => {
    pool.end()
    connection.close()
    channel.close()
  }

  process.on('SIGINT', () => shutdown())
  process.on('SIGTERM', () => shutdown())
}

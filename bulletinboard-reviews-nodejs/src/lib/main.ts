import logger from './util/logger.js'
import pg from 'pg'
import PostgresReviewStorage from './storage/postgres-review-storage.js'
import application from './application.js'
import migrate from './storage/migrate-api.js'


export type Config = {
  app: {
    port: number
  },
  postgres: {
    connectionString: string
  }
}

export default async function main(config: Config) {
  const { app: { port }, postgres } = config

  const log = logger.child({ module: 'server' })

  await migrate(postgres).up()
  const pool = new pg.Pool(postgres)
  const connection = await rabbitMqConnection()
  const storage = new PostgresReviewStorage(pool, logger)
  const queue = new AverageRatingQueue(connection)
  // add queue to app
  const app = application(storage, queue, logger)

  app
    .listen(port, () => log.info('Server is listening on http://localhost:%d', port))
    .on('error', ({ message }) => log.error('Error starting server: %s', message))

  // const shutdown = () => {
  //   // TODO: shutdown the server and the database connection gracefully
  // }

  // process.on('SIGINT', () => shutdown())
  // process.on('SIGTERM', () => shutdown())
}

import logger from './util/logger.js'
import Pool from './storage/pool.js'
import PostgresReviewStorage from './storage/postgres-review-storage.js'
import application from './application.js'
import migrate from './storage/migrate-api.js'

export default async function main (config) {
  const { app: { port }, postgres } = config

  const log = logger.child({ module: 'server' })

  await migrate(postgres).up()
  const pool = new Pool(postgres)
  const storage = new PostgresReviewStorage(pool, logger)
  const app = application(storage, logger)

  app
    .listen(port, () => log.info('Server is listening on http://localhost:%d', port))
    .on('error', ({ message }) => log.error('Error starting server: %s', message))

  // const shutdown = () => {
  //   // TODO: shutdown the server and the database connection gracefully
  // }

  // process.on('SIGINT', () => shutdown())
  // process.on('SIGTERM', () => shutdown())
}
import { STATUS_CODES } from 'http'
import express, { ErrorRequestHandler } from 'express'
import reviewRouter from './router/review-router.js'
import averageRatingRouter from './router/average-rating-router.js'
import NotImplementedError from './error/not-implemented-error.js'
import PostgresReviewStorage from './storage/postgres-review-storage.js'
import { Logger } from 'winston'

// add RabbitMQ here - with correct defined type
export default (storage: PostgresReviewStorage, queue: any, logger: Logger) => {
  const log = logger.child({ module: 'application' })

  const app = express()

  app.use(express.static('public'))

  app.use((req, res, next) => {
    const { method, url } = req
    log.http('%s %s', method, url)
    next()
  })

  app.get('/health', (req, res) => {
    res
      .status(200)
      .type('text/plain')
      .send('OK')
  })

  app.use('/api/v1/reviews', reviewRouter(storage, queue))

  app.use('/api/v1/averageRatings', averageRatingRouter(storage))

  app.use((req, res, next) => {
    const error = new NotImplementedError()
    next(error)
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
    const defaultCode = 500
    const { code = defaultCode, message } = error
    const { method, url } = req
    log.error('Error %s %s - %s', method, url, message)
    const status = STATUS_CODES?.[code] ?? STATUS_CODES[defaultCode]
    res
      .status(code)
      .type('text/plain')
      .send(status)
  }

  app.use(errorHandler)

  return app
}

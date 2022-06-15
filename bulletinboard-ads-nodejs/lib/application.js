import { STATUS_CODES } from 'http'
import express from 'express'
import adRouter from './router/ad-router.js'
import NotImplementedError from './error/not-implemented-error.js'

export default (storage, reviewsClient, logger) => {
  const log = logger.child({ module: 'application' })

  const app = express()

  app.use(express.static('public'))

  // log incoming requests
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

  app.use('/api/v1/ads', adRouter(storage, reviewsClient, logger))

  app.use((req, res, next) => {
    const error = new NotImplementedError()
    next(error)
  })

  app.use((error, req, res, _next) => {
    const defaultCode = 500
    const { code = defaultCode, message } = error
    const { method, url } = req
    log.error('Error %s %s - %s', method, url, message)
    const status = STATUS_CODES?.[code] ?? STATUS_CODES[defaultCode]
    res
      .status(code)
      .type('text/plain')
      .send(status)
  })

  return app
}

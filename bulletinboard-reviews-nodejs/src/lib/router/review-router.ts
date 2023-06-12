import express, { RequestHandler } from 'express'
import PostgresReviewStorage from '../storage/postgres-review-storage.js'
import { validateReview, validateRevieweeEmail, Review, ReviewPayload } from '../validation/validate.js'

type Empty = Record<string, never>

export default (storage: PostgresReviewStorage, queue: any) => {
  const router = express.Router()

  const validateEmail: () => RequestHandler<{ revieweeEmail: string }> = () => (req, res, next) => {
    try {
      validateRevieweeEmail(req.params.revieweeEmail)
      next()
    } catch (err) {
      next(err)
    }
  }

  const validateAndParseReview: () => RequestHandler<Empty, Review, ReviewPayload> = () => (req, res, next) => {
    try {
      const validatedReview = validateReview(req.body)
      req.body = validatedReview
      next()
    } catch (err) {
      next(err)
    }
  }

  router.post('/', express.json(), validateAndParseReview(), async (req, res, next) => {
    const { body } = req
    try {
      const id = await storage.create(body)
        // function to calculate average and send to MessageQ - no async needed
      res
        .status(201)
        .location(`/api/v1/reviews/${id}`)
        .json({
          id,
          ...body
        })
    } catch (error) {
      next(error)
    }
  })

  router.get('/', async (req, res, next) => {
    try {
      const reviews = await storage.readAll()
      res
        .status(200)
        .json(reviews)
    } catch (error) {
      next(error)
    }
  })

  router.get('/:revieweeEmail', validateEmail(), async (req, res, next) => {
    try {
      const { params: { revieweeEmail } } = req
      const reviews = await storage.readAllFor(revieweeEmail)
      res
        .status(200)
        .json(reviews)
    } catch (error) {
      next(error)
    }
  })

  router.delete('/', async (req, res, next) => {
    try {
      await storage.deleteAll()
      res
        .status(200)
        .json()
    } catch (error) {
      next(error)
    }
  })

  return router
}

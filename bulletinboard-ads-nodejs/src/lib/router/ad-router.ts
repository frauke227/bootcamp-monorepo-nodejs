import express, { RequestHandler } from 'express'
import { Logger } from 'winston'
import { validateId, validateAd, AdPayload, Ad } from '../validation/validate.js'
// import ReviewsClient from '../client/reviews-client.js'
import PostgresAdStorage from '../storage/postgres-ad-storage.js'

export default (storage: PostgresAdStorage, endpoint: string, logger: Logger ) => {
  const validateAndParseId: () => RequestHandler<{ id: number }> = () => (req, res, next) => {
    try {
      const id = req.params.id
      logger.debug('Checking id: %s', id)
      const validatedId = validateId(id)
      req.params.id = validatedId
      next()
    } catch (err) {
      next(err)
    }
  }

  const validateAndParseAd: () => RequestHandler<unknown, unknown, AdPayload> = () => (req, res, next) => {
    try {
      const ad = req.body
      // logger.debug('Checking id: %s',add)
      const validatedAd = validateAd(ad)
      req.body = validatedAd
      next()
    } catch (err) {
      next(err)
    }
  }

  const getReviewsUrl = ({ contact }: AdPayload) => {
    return `${endpoint}/#/reviews/${contact}`
  }

  const getTransientProps = (ad: Ad) => {
    return {
      reviewsUrl: getReviewsUrl(ad)
    }
  }

  const router = express.Router()

  router.post('/', express.json(), validateAndParseAd(), async (req, res, next) => {
    const { body } = req
    try {
      const id = await storage.create(body)
      res
        .status(201)
        .location(`/api/v1/ads/${id}`)
        .json({
          id,
          ...body,
          ...getTransientProps({ id, ...body })
        })
    } catch (error) {
      next(error)
    }
  })

  router.get('/', async (req, res, next) => {
    try {
      let ads = await storage.readAll()
      ads = await Promise.all(ads.map(async (ad) => {
        logger.debug('message from get:', ad)
        return {
          ...ad,
          ...getTransientProps(ad)
        }
      }))
      res
        .status(200)
        .json(ads)
    } catch (error) {
      next(error)
    }
  })

  router.get('/:id', validateAndParseId(), async (req, res, next) => {
    try {
      const { params: { id } } = req
      let ad = await storage.read(id)
      ad = {
        ...ad,
        ...getTransientProps(ad)
      }
      res
        .status(200)
        .json(ad)
    } catch (error) {
      next(error)
    }
  })

  router.put('/:id', express.json(), validateAndParseAd(), validateAndParseId(), async (req, res, next) => {
    try {
      const { params: { id }, body } = req
      await storage.update(id, body)
      res
        .status(200)
        .json()
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

  router.delete('/:id', validateAndParseId(), async (req, res, next) => {
    try {
      const { params: { id } } = req
      await storage.delete(id)
      res
        .status(200)
        .json()
    } catch (error) {
      next(error)
    }
  })

  return router
}

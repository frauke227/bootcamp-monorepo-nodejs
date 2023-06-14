import { z } from 'zod'
import IllegalArgumentError from '../error/illegal-argument-error.js'

const AdPayload = z.object({
  title: z.string().min(1),
  contact: z.string().min(1),
  price: z.coerce.number().gte(1),
  currency: z.string().min(1)
})

const Ad = AdPayload.extend({
  id: z.string()
})

const ReviewPaylaod = z.object({
  revieweeEmail: z.string().min(1),
  averageRating: z.number().min(1)
})

const Id = z.coerce.number().gte(1)

export type AdPayload = z.infer<typeof AdPayload>
export type ReviewPaylaod = z.infer<typeof ReviewPaylaod>
export type Ad = z.infer<typeof Ad>

export const validateAd = (adPayload: unknown) => {
  const result = AdPayload.safeParse(adPayload)
  if (!result.success) {
    throw new IllegalArgumentError()
  }
  return result.data
}

export const validateId = (id: unknown): number => {
  const result = Id.safeParse(id)
  if (!result.success) {
    throw new IllegalArgumentError()
  }
  return result.data
}

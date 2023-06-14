// import assert from 'assert/strict'
// import sinon, { SinonStubbedInstance } from 'sinon'
// import pg from 'pg'
// import { Logger } from 'winston'
// import supertest from 'supertest'
// import { FIRST_REVIEW, SECOND_REVIEW } from '../data/reviews.js'
// import logger from '../../src/lib/util/logger.js'
// import PostgresReviewStorage from '../../src/lib/storage/postgres-review-storage.js'
// import application from '../../src/lib/application.js'
// import migrate from '../../src/lib/storage/migrate-api.js'

// describe('average-rating-router', () => {
//   const connectionString = 'postgresql://postgres:postgres@localhost:6543/postgres'

//   let loggerStub: SinonStubbedInstance<Logger>
//   let pool: pg.Pool
//   let storage: PostgresReviewStorage
//   let client: supertest.SuperTest<supertest.Test>

//   before(async () => {
//     await migrate({ connectionString }).up()
//     pool = new pg.Pool({ connectionString })
//   })

//   beforeEach(() => {
//     loggerStub = sinon.stub(logger)
//     loggerStub.child.returnsThis()
//     storage = new PostgresReviewStorage(pool, loggerStub)
//     const app = application(storage, loggerStub)
//     client = supertest(app)
//   })

//   afterEach(async () => {
//     await storage.deleteAll()
//     sinon.restore()
//   })

//   after(async () => {
//     await pool.end()
//   })

//   describe('get /:revieweeEmail', () => {
//     it('should read the average rating', async () => {
//       await storage.create(FIRST_REVIEW)
//       await storage.create(SECOND_REVIEW)
//       const { body } =
//         await client
//           .get(`/api/v1/averageRatings/${FIRST_REVIEW.revieweeEmail}`)
//           .expect(200)
//           .expect('Content-Type', /application\/json/)
//       assert.deepEqual(body, {
//         averageRating: (FIRST_REVIEW.rating + SECOND_REVIEW.rating) / 2
//       })
//     })
//   })
// })

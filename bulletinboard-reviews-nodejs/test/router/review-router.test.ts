// import assert from 'assert/strict'
// import { STATUS_CODES } from 'http'
// import sinon, { SinonStubbedInstance } from 'sinon'
// import pg from 'pg'
// import { Logger } from 'winston'
// import supertest from 'supertest'
// import { FIRST_REVIEW, SECOND_REVIEW } from '../data/reviews.js'
// import logger from '../../src/lib/util/logger.js'
// import PostgresReviewStorage from '../../src/lib/storage/postgres-review-storage.js'
// import application from '../../src/lib/application.js'
// import migrate from '../../src/lib/storage/migrate-api.js'
// import { Review } from '../../src/lib/validation/validate.js'

// const MOUNT_PATH = '/api/v1/reviews'

// describe('review-router', () => {
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
//     storage = new PostgresReviewStorage(pool, logger)
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

//   describe('post /', () => {
//     it('should reject with an error when creating an invalid review', async () => {
//       const { text } =
//         await client
//           .post(MOUNT_PATH)
//           .send({})
//           .expect(400)
//           .expect('Content-Type', /text\/plain/)
//       assert.equal(text, STATUS_CODES[400])
//     })

//     it('should create an review', async () => {
//       const { body, headers } =
//         await client
//           .post(MOUNT_PATH)
//           .send(FIRST_REVIEW)
//           .expect(201)
//           .expect('Content-Type', /application\/json/)

//       const id = body.id
//       assert.equal(headers.location, `/api/v1/reviews/${id}`)
//       assert.deepEqual(body, {
//         id,
//         ...FIRST_REVIEW
//       })
//     })
//   })

//   describe('get /', () => {
//     it('should read a list of reviews', async () => {
//       const id1 = await storage.create(FIRST_REVIEW)
//       const id2 = await storage.create(SECOND_REVIEW)
//       const { body } =
//         await client
//           .get(MOUNT_PATH)
//           .expect(200)
//           .expect('Content-Type', /application\/json/)

//       assert.equal(body.length, 2)
//       const review1 = body.find((ad: Review) => ad.id === id1)
//       const review2 = body.find((ad: Review) => ad.id === id2)
//       assert.deepEqual(review1, {
//         id: id1,
//         ...FIRST_REVIEW
//       })
//       assert.deepEqual(review2, {
//         id: id2,
//         ...SECOND_REVIEW
//       })
//     })
//   })

//   describe('get /:revieweeEmail', () => {
//     it('should reject with an error when providing an invalid revieweeEmail', async () => {
//       const { text } =
//         await client
//           .get(`${MOUNT_PATH}/invalid`)
//           .expect(400)
//           .expect('Content-Type', 'text/plain; charset=utf-8')
//       assert.equal(text, STATUS_CODES[400])
//     })
//     it('should read a list of reviews for given reviewee email', async () => {
//       const id1 = await storage.create(FIRST_REVIEW)
//       const id2 = await storage.create(SECOND_REVIEW)
//       await storage.create({ ...FIRST_REVIEW, revieweeEmail: 'some.other@acme.org' })

//       const { body } =
//         await client
//           .get(`${MOUNT_PATH}/${FIRST_REVIEW.revieweeEmail}`)
//           .expect(200)
//           .expect('Content-Type', /application\/json/)

//       assert.equal(body.length, 2)
//       const review1 = body.find((ad: Review) => ad.id === id1)
//       const review2 = body.find((ad: Review) => ad.id === id2)
//       assert.deepEqual(review1, {
//         id: id1,
//         ...FIRST_REVIEW
//       })
//       assert.deepEqual(review2, {
//         id: id2,
//         ...SECOND_REVIEW
//       })
//     })
//   })

//   describe('delete /', () => {
//     it('delete all reviews', async () => {
//       const { body } =
//         await client
//           .delete(MOUNT_PATH)
//           .expect(200)
//           .expect('Content-Type', /application\/json/)
//       assert.deepEqual(body, '')
//     })
//   })
// })

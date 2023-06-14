// import assert from 'assert/strict'
// import { STATUS_CODES } from 'http'
// import sinon, { SinonStubbedInstance } from 'sinon'
// import pg from 'pg'
// import { Logger } from 'winston'
// import supertest from 'supertest'
// import logger from '../../src/lib/util/logger.js'
// import PostgresAdStorage from '../../src/lib/storage/postgres-ad-storage.js'
// import ReviewsClient from '../../src/lib/client/reviews-client.js'
// import { AdPayload, Ad } from '../../src/lib/validation/validate.js'
// import application from '../../src/lib/application.js'
// import migrate from '../../src/lib/storage/migrate-api.js'
// import { WOLLY_SOCKS, USED_SHOES } from '../data/ads.js'

// const REVIEWS_ENDPOINT = 'http://localhost:9090'
// const AVERAGE_RATING = 3.1415

// const getTransientProps = ({ contact }: AdPayload) => ({
//   averageContactRating: AVERAGE_RATING,
//   reviewsUrl: `${REVIEWS_ENDPOINT}/#/reviews/${contact}`
// })

// describe('ad-router', () => {
//   const connectionString = 'postgresql://postgres:postgres@localhost:5432/postgres'

//   let pool: pg.Pool
//   let loggerStub: SinonStubbedInstance<Logger>
//   let storage: PostgresAdStorage
//   let reviewsClient: SinonStubbedInstance<ReviewsClient>
//   let client: supertest.SuperTest<supertest.Test>

//   before(async () => {
//     await migrate({ connectionString }).up()
//     pool = new pg.Pool({ connectionString })
//   })

//   beforeEach(async () => {
//     reviewsClient = sinon.createStubInstance(ReviewsClient, {
//       getEndpoint: REVIEWS_ENDPOINT,
//       getAverageRating: Promise.resolve(AVERAGE_RATING)
//     })
//     loggerStub = sinon.stub(logger)
//     loggerStub.child.returnsThis()
//     storage = new PostgresAdStorage(pool, loggerStub)
//     const app = application(storage, reviewsClient, loggerStub)
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
//     it('should reject with an error when creating an invalid ad', async () => {
//       const { text } =
//         await client
//           .post('/api/v1/ads')
//           .send({})
//           .expect(400)
//           .expect('Content-Type', /text\/plain/)
//       assert.equal(text, STATUS_CODES[400])
//     })

//     it('should create an ad', async () => {
//       const { body, headers } =
//         await client
//           .post('/api/v1/ads')
//           .send(WOLLY_SOCKS)
//           .expect(201)
//           .expect('Content-Type', /application\/json/)

//       const id = body.id
//       assert.equal(headers.location, `/api/v1/ads/${id}`)
//       assert.deepEqual(body, {
//         id,
//         ...WOLLY_SOCKS,
//         ...getTransientProps(WOLLY_SOCKS)
//       })
//     })
//   })

//   describe('get /', () => {
//     it('should read a list of ads', async () => {
//       const [id1, id2] = await Promise.all([storage.create(WOLLY_SOCKS), storage.create(USED_SHOES)])

//       const { body } =
//         await client
//           .get('/api/v1/ads')
//           .expect(200)
//           .expect('Content-Type', /application\/json/)

//       assert.equal(body.length, 2)
//       const ad1 = body.find((ad: Ad) => ad.id === id1)
//       const ad2 = body.find((ad: Ad) => ad.id === id2)
//       assert.deepEqual(ad1, {
//         id: id1,
//         ...WOLLY_SOCKS,
//         ...getTransientProps(WOLLY_SOCKS)
//       })
//       assert.deepEqual(ad2, {
//         id: id2,
//         ...USED_SHOES,
//         ...getTransientProps(USED_SHOES)
//       })
//     })
//   })

//   describe('get /:id', () => {
//     it('should reject with an error when reading an invalid id', async () => {
//       const id = 'Not-A-Number'
//       const code = 400
//       const { text } =
//         await client
//           .get(`/api/v1/ads/${id}`)
//           .expect(code)
//           .expect('Content-Type', /text\/plain/)
//       assert.equal(text, STATUS_CODES[code])
//     })

//     it('should reject with an error when reading a non-existing ad', async () => {
//       const id = 42
//       const code = 404
//       const { text } =
//         await client
//           .get(`/api/v1/ads/${id}`)
//           .expect(code)
//           .expect('Content-Type', /text\/plain/)
//       assert.equal(text, STATUS_CODES[code])
//     })

//     it('should read an ad', async () => {
//       const id = await storage.create(WOLLY_SOCKS)
//       const { body } =
//         await client
//           .get(`/api/v1/ads/${id}`)
//           .expect(200)
//           .expect('Content-Type', /application\/json/)
//       assert.deepEqual(body, {
//         id,
//         ...WOLLY_SOCKS,
//         ...getTransientProps(WOLLY_SOCKS)
//       })
//     })
//   })

//   describe('put /:id', () => {
//     it('should reject with an error when updating an invalid id', async () => {
//       const id = 'Not-A-Number'
//       const code = 400
//       const { text } =
//         await client
//           .put(`/api/v1/ads/${id}`)
//           .send(WOLLY_SOCKS)
//           .expect(code)
//           .expect('Content-Type', /text\/plain/)
//       assert.equal(text, STATUS_CODES[code])
//     })

//     it('should reject with an error when updating a non-existing ad', async () => {
//       const id = 42
//       const code = 404
//       const { text } =
//         await client
//           .put(`/api/v1/ads/${id}`)
//           .send(WOLLY_SOCKS)
//           .expect(code)
//           .expect('Content-Type', /text\/plain/)
//       assert.equal(text, STATUS_CODES[code])
//     })

//     it('should reject with an error when updating an invalid ad', async () => {
//       const id = 1
//       for (const key of Object.keys(WOLLY_SOCKS)) {
//         const invalid = {
//           [key]: null
//         }
//         const invalidAd = {
//           ...WOLLY_SOCKS,
//           ...invalid
//         }
//         const code = 400
//         const { text } =
//           await client
//             .put(`/api/v1/ads/${id}`)
//             .send(invalidAd)
//             .expect(code)
//             .expect('Content-Type', /text\/plain/)
//         assert.equal(text, STATUS_CODES[code])
//       }
//     })

//     it('should update an ad', async () => {
//       const id = await storage.create(USED_SHOES)
//       const { body } =
//         await client
//           .put(`/api/v1/ads/${id}`)
//           .send(WOLLY_SOCKS)
//           .expect(200)
//           .expect('Content-Type', /application\/json/)
//       assert.deepEqual(body, '')
//     })
//   })

//   describe('delete /', () => {
//     it('delete all ads', async () => {
//       const { body } =
//         await client
//           .delete('/api/v1/ads')
//           .expect(200)
//           .expect('Content-Type', /application\/json/)
//       assert.deepEqual(body, '')
//     })
//   })

//   describe('delete /:id', () => {
//     it('should reject with an error when deleting an invalid id', async () => {
//       const id = 'Not-A-Number'
//       const code = 400
//       const { text } =
//         await client
//           .delete(`/api/v1/ads/${id}`)
//           .expect(code)
//           .expect('Content-Type', /text\/plain/)
//       assert.equal(text, STATUS_CODES[code])
//     })

//     it('should reject with an error when deleting a non-existing ad', async () => {
//       const id = 42
//       const code = 404
//       const { text } =
//         await client
//           .delete(`/api/v1/ads/${id}`)
//           .expect(code)
//           .expect('Content-Type', /text\/plain/)
//       assert.equal(text, STATUS_CODES[code])
//     })

//     it('should delete an ad', async () => {
//       const id = await storage.create(WOLLY_SOCKS)
//       const { body } =
//         await client
//           .delete(`/api/v1/ads/${id}`)
//           .expect(200)
//           .expect('Content-Type', /application\/json/)
//       assert.deepEqual(body, '')
//     })
//   })
// })

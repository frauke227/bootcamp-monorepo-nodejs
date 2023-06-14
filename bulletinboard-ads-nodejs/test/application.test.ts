// import assert from 'assert/strict'
// import { STATUS_CODES } from 'http'
// import sinon, { SinonStubbedInstance } from 'sinon'
// import { Logger } from 'winston'
// import supertest from 'supertest'
// import { readFile } from 'fs/promises'
// import { join } from 'path'
// import logger from '../src/lib/util/logger.js'
// import PostgresAdStorage from '../src/lib/storage/postgres-ad-storage.js'
// import application from '../src/lib/application.js'
// import ReviewsClient from '../src/lib/client/reviews-client.js'

// describe('application', () => {
//   let loggerStub: SinonStubbedInstance<Logger>
//   let storageStub: SinonStubbedInstance<PostgresAdStorage>
//   let reviewsClientStub: SinonStubbedInstance<ReviewsClient>
//   let client: supertest.SuperTest<supertest.Test>

//   beforeEach(() => {
//     loggerStub = sinon.stub(logger)
//     loggerStub.child.returnsThis()
//     reviewsClientStub = sinon.createStubInstance(ReviewsClient)
//     storageStub = sinon.createStubInstance(PostgresAdStorage)
//     const app = application(storageStub, reviewsClientStub, loggerStub)
//     client = supertest(app)
//   })

//   afterEach(() => sinon.restore())

//   describe('get /public', () => {
//     it('should serve the ui', async () => {
//       const { text } =
//         await client
//           .get('/')
//           .expect(200)
//           .expect('Content-Type', /text\/html/)
//       const path = join(process.cwd(), 'public', 'index.html')
//       const index = await readFile(path, 'utf8')
//       assert.equal(text, index)
//     })
//   })

//   describe('get /health', () => {
//     it('should be ok', async () => {
//       const { text } =
//         await client
//           .get('/health')
//           .expect(200)
//           .expect('Content-Type', /text\/plain/)
//       assert.equal(text, 'OK')
//     })
//   })

//   describe('any /*', () => {
//     it('should not be implemented', async () => {
//       const code = 501
//       let response = await client.get('/not/implemented')
//         .expect(code)
//         .expect('Content-Type', /text\/plain/)
//       assert.equal(response.text, STATUS_CODES[code])

//       response = await client.post('/not/implemented')
//         .expect(code)
//         .expect('Content-Type', /text\/plain/)
//       assert.equal(response.text, STATUS_CODES[code])

//       response = await client.put('/not/implemented')
//         .expect(code)
//         .expect('Content-Type', /text\/plain/)
//       assert.equal(response.text, STATUS_CODES[code])

//       response = await client.delete('/not/implemented')
//         .expect(code)
//         .expect('Content-Type', /text\/plain/)

//       assert.equal(response.text, STATUS_CODES[code])
//     })
//   })
// })

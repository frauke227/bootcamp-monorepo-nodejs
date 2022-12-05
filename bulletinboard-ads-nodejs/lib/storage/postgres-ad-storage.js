import util from 'util'
import IllegalArgumentError from '../error/illegal-argument-error.js'
import NotFoundError from '../error/not-found-error.js'

export default class PostgresAdStorage {
  static EXISTS = 'SELECT EXISTS(SELECT 1 FROM ads WHERE id=$1)'
  static CREATE = 'INSERT INTO ads (title, contact, price, currency) VALUES ($1, $2, $3, $4) RETURNING id'
  static READ = 'SELECT id, title, contact, price, currency FROM ads WHERE id = $1'
  static READ_ALL = 'SELECT id, title, contact, price, currency FROM ads'
  static UPDATE = 'UPDATE ads SET (title, contact, price, currency) = ($2, $3, $4, $5) WHERE id = $1'
  static DELETE = 'DELETE FROM ads WHERE id = $1'
  static DELETE_ALL = 'DELETE FROM ads'

  #log = null
  #pool = null

  constructor (pool, logger) {
    this.#pool = pool
    this.#log = logger.child({ module: 'postgres-ad-storage' })
    this.#pool.on('error', ({ message }) => {
      this.#log.error('Error raised by pg client: %s', message)
    })
  }

  async #checkId (id) {
    this.#log.debug('Checking id: %s', id)
    if (!id || typeof id !== 'number' || id < 1) {
      const message = util.format('Invalid id: %s', id)
      throw new IllegalArgumentError(message)
    }
    const { rows: [{ exists }] } = await this.#pool.query(PostgresAdStorage.EXISTS, [id])
    if (!exists) {
      const message = util.format('No ad found for id: %s', id)
      throw new NotFoundError(message)
    }
  }

  #checkAd ({ title, contact, price, currency }) {
    this.#log.debug('Checking ad: %O', { title, contact, price, currency })
    if (!title || typeof title !== 'string' ||
      !contact || typeof contact !== 'string' ||
      !price || typeof price !== 'number' ||
      !currency || typeof currency !== 'string') {
      const message = util.format('Invalid ad: %O', { title, contact, price, currency })
      throw new IllegalArgumentError(message)
    }
  }

  async create ({ title, contact, price, currency }) {
    try {
      this.#log.debug('Creating ad: %O', { title, contact, price, currency })
      this.#checkAd({ title, contact, price, currency })
      const { rows: [{ id }] } = await this.#pool.query(PostgresAdStorage.CREATE, [title, contact, price, currency])
      this.#log.debug('Successfully created ad: %O - %d', { title, contact, price, currency }, id)
      return id
    } catch (error) {
      const { message } = error
      this.#log.error('Error creating ad: %O - %s', { title, contact, price, currency }, message)
      throw error
    }
  }

  async read (id) {
    try {
      this.#log.debug('Reading ad with id: %s', id)
      await this.#checkId(id)
      const { rows: [ad] } = await this.#pool.query(PostgresAdStorage.READ, [id])
      this.#log.debug('Successfully read ad with id: %s - %O', ad)
      return ad
    } catch (error) {
      const { message } = error
      this.#log.error('Error reading ad with id: %s - %s', id, message)
      throw error
    }
  }

  async readAll () {
    try {
      this.#log.debug('Reading all ads')
      const { rows } = await this.#pool.query(PostgresAdStorage.READ_ALL)
      this.#log.debug('Successfully read all ads - %O', rows)
      return rows
    } catch (error) {
      const { message } = error
      this.#log.error('Error reading all ads - %s', message)
      throw error
    }
  }

  async update (id, { title, contact, price, currency }) {
    try {
      this.#log.debug('Updating ad with id: %s with update: %O', id, { title, contact, price, currency })
      await this.#checkId(id)
      this.#checkAd({ title, contact, price, currency })
      await this.#pool.query(PostgresAdStorage.UPDATE, [id, title, contact, price, currency])
      this.#log.debug('Successfully updated ad with id: %s with update: %O', id, { title, contact, price, currency })
    } catch (error) {
      const { message } = error
      this.#log.error('Error updating ad with id: %s with update: %O - %s', id, { title, contact, price, currency }, message)
      throw error
    }
  }

  async delete (id) {
    try {
      this.#log.debug('Deleting ad with id: %s', id)
      await this.#checkId(id)
      await this.#pool.query(PostgresAdStorage.DELETE, [id])
      this.#log.debug('Successfully deleted ad with id: %s', id)
    } catch (error) {
      const { message } = error
      this.#log.error('Error deleting ad with id: %s - %s', id, message)
      throw error
    }
  }

  async deleteAll () {
    try {
      this.#log.debug('Deleting all ads')
      await this.#pool.query(PostgresAdStorage.DELETE_ALL)
      this.#log.debug('Successfully deleted all ads')
    } catch ({ message }) {
      this.#log.error('Error deleting all ads - %s', message)
      throw new Error(message)
    }
  }
}

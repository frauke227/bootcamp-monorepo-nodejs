import util from 'util'
import { Pool } from 'pg'
import { Logger } from 'winston'
import NotFoundError from '../error/not-found-error.js'
import { AdPayload, Ad } from '../validation/validate.js'

export default class PostgresAdStorage {
  static EXISTS = 'SELECT EXISTS(SELECT 1 FROM ads WHERE id=$1)'
  static CREATE = 'INSERT INTO ads (title, contact, price, currency) VALUES ($1, $2, $3, $4) RETURNING id'
  static READ = 'SELECT ads.id, ads.title, ads.contact, ads.price, ads.currency FROM ads LEFT JOIN reviews ON ads.contact = reviews.contact WHERE id = $1'
  static READ_ALL = 'SELECT ads.id, ads.title, ads.contact, ads.price, ads.currency FROM ads LEFT JOIN reviews ON ads.contact = reviews.contact'
  static UPDATE = 'UPDATE ads SET (title, contact, price, currency) = ($2, $3, $4, $5) WHERE id = $1'
  static DELETE = 'DELETE FROM ads WHERE id = $1'
  static DELETE_ALL = 'DELETE FROM ads'

  private logger: Logger
  private pool: Pool

  constructor(pool: Pool, logger: Logger) {
    this.pool = pool
    this.logger = logger.child({ module: 'postgres-ad-storage' })
    this.pool.on('error', ({ message }) => {
      this.logger.error('Error raised by pg client: %s', message)
    })
  }

  private async checkExists(id: number) {
    this.logger.debug('Checking id: %s', id)
    const { rows: [{ exists }] } = await this.pool.query<{ exists: boolean }>(PostgresAdStorage.EXISTS, [id])
    if (!exists) {
      const message = util.format('No ad found for id: %s', id)
      throw new NotFoundError(message)
    }
  }

  async create({ title, contact, price, currency }: AdPayload) {
    try {
      this.logger.debug('Creating ad: %O', { title, contact, price, currency })
      const { rows: [{ id }] } = await this.pool.query(PostgresAdStorage.CREATE, [title, contact, price, currency])
      this.logger.debug('Successfully created ad: %O - %d', { title, contact, price, currency }, id)
      return id
    } catch (error) {
      console.log(error)
      const { message } = error as Error
      this.logger.error('Error creating ad: %O - %s', { title, contact, price, currency }, message)
      throw error
    }
  }

  async read(id: number) {
    try {
      this.logger.debug('Reading ad with id: %s', id)
      await this.checkExists(id)
      const { rows: [ad] } = await this.pool.query(PostgresAdStorage.READ, [id])
      this.logger.debug('Successfully read ad with id: %s - %O', ad)
      return ad
    } catch (error) {
      const { message } = error as Error
      this.logger.error('Error reading ad with id: %s - %s', id, message)
      throw error
    }
  }

  async readAll() {
    try {
      this.logger.debug('Reading all ads')
      const response = await this.pool.query(PostgresAdStorage.READ_ALL)
      const {rows} = response
      this.logger.debug('Successfully read all response - %O', response)
      this.logger.debug('Successfully read all ads - %O', rows)
      return rows
    } catch (error) {
      const { message } = error as Error
      this.logger.error('Error reading all ads - %s', message)
      throw error
    }
  }

  async update(id: number, { title, contact, price, currency }: AdPayload) {
    try {
      this.logger.debug('Updating ad with id: %s with update: %O', id, { title, contact, price, currency })
      await this.checkExists(id)
      await this.pool.query(PostgresAdStorage.UPDATE, [id, title, contact, price, currency])
      this.logger.debug('Successfully updated ad with id: %s with update: %O', id, { title, contact, price, currency })
    } catch (error) {
      const { message } = error as Error
      this.logger.error('Error updating ad with id: %s with update: %O - %s', id, { title, contact, price, currency }, message)
      throw error
    }
  }

  async delete(id: number) {
    try {
      this.logger.debug('Deleting ad with id: %s', id)
      await this.checkExists(id)
      await this.pool.query(PostgresAdStorage.DELETE, [id])
      this.logger.debug('Successfully deleted ad with id: %s', id)
    } catch (error) {
      const { message } = error as Error
      this.logger.error('Error deleting ad with id: %s - %s', id, message)
      throw error
    }
  }

  async deleteAll() {
    try {
      this.logger.debug('Deleting all ads')
      await this.pool.query(PostgresAdStorage.DELETE_ALL)
      this.logger.debug('Successfully deleted all ads')
    } catch (error) {
      const { message } = error as Error
      this.logger.error('Error deleting all ads - %s', message)
      throw new Error(message)
    }
  }
}

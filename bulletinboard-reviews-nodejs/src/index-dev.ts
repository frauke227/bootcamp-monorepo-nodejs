import main, { Config } from './lib/main.js'

const config: Config = {
  app: {
    port: 9090
  },
  postgres: {
    connectionString: 'postgresql://postgres:postgres@localhost:6543/bulletinboard_reviews_dev'
  },
  // queue: {
  //   connectionString
  // }
}

main(config)

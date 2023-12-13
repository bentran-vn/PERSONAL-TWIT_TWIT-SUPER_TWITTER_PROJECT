import { isProduction } from '~/constants/config'

interface MONGODB {
  port: string
  username: string
  password: string
  dbName: string
}

let MONGODB = {}

if (!isProduction) {
  MONGODB = {
    port: process.env.PRO_DB_PORT,
    username: process.env.PRO_DB_USERNAME,
    password: process.env.PRO_DB_PASSWORD,
    dbName: process.env.PRO_DB_NAME
  }
} else {
  MONGODB = {
    port: process.env.PRO_DB_PORT,
    username: process.env.PRO_DB_USERNAME,
    password: process.env.PRO_DB_PASSWORD,
    dbName: process.env.PRO_DB_NAME
  }
}

export default MONGODB as MONGODB

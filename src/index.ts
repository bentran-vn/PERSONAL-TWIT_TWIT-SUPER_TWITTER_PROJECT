//Imports Libraries
import express from 'express'
import 'dotenv/config'
import Database from './database/Database'
import MongodbDatabase from './database/MongoDbConnection'
import { initFolder } from './utils/file'
import { defaultErrorHandler } from './middlewares/error.middlewares'

//Imports Routes
import usersRouter from './routes/users.routes'
import followerRoutes from './routes/followers.routes'
import mediaRouter from './routes/media.routes'
import { isProduction } from './constants/config'

//Config Server
const app = express()
const PORT = !isProduction ? `${process.env.SERVER_PORT_DEVELOPER}` : `${process.env.SERVER_PORT_PRODUCTION}`
const SERVER = !isProduction ? `${process.env.SERVER_URL_DEVELOPER}` : `${process.env.SERVER_URL_PRODUCTION}`
//Init Folder
initFolder()

//Config Database
const database = Database.getInstance()
database.connect(MongodbDatabase.getInstance())

//Config Swagger

//Config Cron Jobs

//Config Middlewares
app.use(express.json())

//Implement Routes
app.use('/users', usersRouter)
app.use('/followers', followerRoutes)
app.use('/medias', mediaRouter)

//Implement Error Handler
app.use(defaultErrorHandler)

//Server Running
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Server URL: ${SERVER}`)
})

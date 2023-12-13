//Imports Libraries
import express from 'express'
import 'dotenv/config'
import Database from './database/Database'
import MongodbDatabase from './database/MongoDbConnection'
import { initFolder } from './utils/file'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import { isProduction } from './constants/config'

//Imports Routes
import usersRouter from './routes/users.routes'
import followerRoutes from './routes/followers.routes'
import mediaRouter from './routes/media.routes'
import staticRouter from './routes/static.routes'

//Config Server
const app = express()
const PORT = !isProduction ? `${process.env.SERVER_PORT_DEVELOPER}` : `${process.env.SERVER_PORT_PRODUCTION}`
const SERVER = !isProduction ? `${process.env.SERVER_URL_DEVELOPER}` : `${process.env.SERVER_URL_PRODUCTION}`
// app.use('/static', express.static(UPLOAD_DIR))

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
app.use('/static', staticRouter)

//Implement Error Handler
app.use(defaultErrorHandler)

//Server Running
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Server URL: ${SERVER}`)
})

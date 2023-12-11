//Imports Libraries
import express, { NextFunction, Request, Response } from 'express'
import 'dotenv/config'
import Database from './database/Database'
import MongodbDatabase from './database/MongoDbConnection'

//Imports Routes
import usersRouter from './routes/users.routes'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import followerRoutes from './routes/followers.routes'
import mediaRouter from './routes/media.routes'
import { initFolder } from './utils/file'

//Config Server
const app = express()
const PORT = 4000 || process.env.SERVER_PORT

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
  console.log(`Server URL: http://localhost:${PORT}`)
})

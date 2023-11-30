//Imports Libraries
import express from 'express'
import { run } from './database/database'

//Imports Routes
import usersRouter from './routes/users.routes'

//Config Server
const app = express()
const PORT = 3000

//Config Database
run().catch(console.dir)

//Config Swagger

//Config Cron Jobs

//Config Middlewares
app.use(express.json())

//Implement Routes
app.use('/users', usersRouter)

//Server Running
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

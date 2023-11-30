import express from 'express'
import usersRoute from './routes/users.routes'

const app = express()

const usersRouter = usersRoute

const PORT = 3000

app.use(express.json())

app.use('/users', usersRouter)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

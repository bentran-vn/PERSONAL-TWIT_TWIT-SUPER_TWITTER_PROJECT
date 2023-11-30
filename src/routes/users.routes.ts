import { Router } from 'express'
import { loginController } from '~/controllers/users.controller'
import { loginValidator } from '~/middlewares/users.middlewares'

const usersRoute = Router()

usersRoute.get('/login', loginValidator, loginController)

export default usersRoute

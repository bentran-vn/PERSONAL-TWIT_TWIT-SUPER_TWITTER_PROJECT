import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controller'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'

const usersRoute = Router()

usersRoute.post('/login', loginValidator, loginController)
usersRoute.post('/register', registerValidator, registerController)

export default usersRoute

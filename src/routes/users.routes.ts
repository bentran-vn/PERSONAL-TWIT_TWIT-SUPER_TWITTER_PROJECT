import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controller'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'

const usersRoute = Router()

usersRoute.post('/login', loginValidator, loginController)

/*
Description: Register a new user
Path: /users/register
Method: POST
body: {
    name: string,
    email: string,
    password: string
    confirmPassword: string
    date_of_birth: string theo chuẩn ISO 8601
}
*/
usersRoute.post('/register', registerValidator, registerController)

export default usersRoute

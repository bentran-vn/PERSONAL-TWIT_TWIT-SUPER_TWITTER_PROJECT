import { Router } from 'express'
import { loginController, logoutController, registerController } from '~/controllers/users.controller'
import {
  accessTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

const usersRoute = Router()

usersRoute.get('/login', loginValidator, wrapAsync(loginController))

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
usersRoute.post('/register', registerValidator, wrapAsync(registerController))

/**
Description: Logout an account
Path: /users/logout
Method: POST
headers: { Authorization: Bearer <access_token> }
body: { refreshToken: string }
 */
usersRoute.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))
export default usersRoute

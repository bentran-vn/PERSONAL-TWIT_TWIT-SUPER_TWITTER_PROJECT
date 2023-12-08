import { Router } from 'express'
import {
  emailVerifyTokenController,
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController
} from '~/controllers/users.controller'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
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

/**
Description: Refresh access token
khi người dùng đăng kí họ sẽ nhận được mail có link dạng
http://localhost:3000/users/verify-email?token=<email_verify_token>
nếu mà em nhấp vào link thì sẽ tạo ra request có query là token
sever kiểm tra token có hợp lệ không,
thì từ decoded.email_verify_token lấy ra user_id
và vào user_id đó để update lại email_verify_token thành null, verified_email thành 1,update_at
 */
usersRoute.post('/verify-email', emailVerifyTokenValidator, wrapAsync(emailVerifyTokenController))

/**
Description: Resend email verify token
Khi email thất lạc, hoặc email_verify_token hết hạn, thì người dùng có
nhu cầu resend email verify token
method: POST
Path: /users/resend-verify-email
hearders: { Authorization: Bearer <access_token> }
//đăng nhập mới được resend
 */
usersRoute.post('/resend-verify-email', accessTokenValidator, wrapAsync(resendVerifyEmailController))
export default usersRoute

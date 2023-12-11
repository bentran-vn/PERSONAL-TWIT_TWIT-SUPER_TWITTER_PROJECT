import { Router } from 'express'
import {
  changePasswordController,
  emailVerifyTokenController,
  forgotPasswordController,
  getMeController,
  getProfileController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  unfollowController,
  updateMeController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controller'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  changePasswordValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'
import { UpdateMeReqBody } from '~/models/request/Users.request'
import { wrapAsync } from '~/utils/handlers'

const usersRouter = Router()

usersRouter.get('/login', loginValidator, wrapAsync(loginController))

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
usersRouter.post('/register', registerValidator, wrapAsync(registerController))

/**
Description: Logout an account
Path: /users/logout
Method: POST
headers: { Authorization: Bearer <access_token> }
body: { refreshToken: string }
 */
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))

/**
Description: Refresh access token
khi người dùng đăng kí họ sẽ nhận được mail có link dạng
http://localhost:3000/users/verify-email?token=<email_verify_token>
nếu mà em nhấp vào link thì sẽ tạo ra request có query là token
sever kiểm tra token có hợp lệ không,
thì từ decoded.email_verify_token lấy ra user_id
và vào user_id đó để update lại email_verify_token thành null, verified_email thành 1,update_at
 */
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapAsync(emailVerifyTokenController))

/**
Description: Resend email verify token
Khi email thất lạc, hoặc email_verify_token hết hạn, thì người dùng có
nhu cầu resend email verify token
method: POST
Path: /users/resend-verify-email
hearders: { Authorization: Bearer <access_token> }
//đăng nhập mới được resend
 */
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapAsync(resendVerifyEmailController))

/**
Description: khi người dùng quên mật khẩu, họ gửi email để xin mình tạo cho họ một forgot_password_token
Path: /users/forgot-password
method: POST
body: { email: string }
*/
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapAsync(forgotPasswordController))

/**
Description: khi người dùng nhấp vào link forgot-password,
 thì sẽ tạo ra request kèm theo forgot_password_token lên server
 server sẽ kiểm tra forgot_password_token có hợp lệ không
 sau đó chuyển hướng người dùng đến trang đổi mật khẩu
Path: /users/verify-forgot-password
method: POST
body: { forgot_password_token: string }
 */
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapAsync(verifyForgotPasswordTokenController)
)

/**
Description: reset password
Path: /users/reset-password
method: POST
body: {
    forgot_password_token: string
    password: string
    confirmPassword: string
  }
 */
usersRouter.post(
  '/reset-password',
  resetPasswordValidator,
  verifyForgotPasswordTokenValidator,
  wrapAsync(resetPasswordController)
)

/**
description: lấy thông tin của user đang đăng nhập
path: /users/me
method: GET
headers: { Authorization: Bearer <access_token> }
body: {}
*/
usersRouter.get('/me', accessTokenValidator, wrapAsync(getMeController))

usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  filterMiddleware<UpdateMeReqBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'username',
    'avatar',
    'cover_photo'
  ]),
  updateMeValidator,
  wrapAsync(updateMeController)
)

/*
des: get profile của user khác bằng unsername
path: '/:username'
method: get
không cần header vì, chưa đăng nhập cũng có thể xem
*/
usersRouter.get('/:username', wrapAsync(getProfileController))

/**
 * Description: Change Password
 * Path: /users/change-password
 * Method: PUT
 * Headers: { Authorization: Bearer <access_token> }
 * body: { old_password: string, password: string, confirm_password: string }
 */
usersRouter.put(
  '/change-password',
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  wrapAsync(changePasswordController)
)

/**
 * Discription: Refresh Token
 * Path: /users/refresh-token
 * Method: POST
 * body: { refresh_token: string }
 */
usersRouter.post('/refresh-token', refreshTokenValidator, wrapAsync(refreshTokenController))

export default usersRouter

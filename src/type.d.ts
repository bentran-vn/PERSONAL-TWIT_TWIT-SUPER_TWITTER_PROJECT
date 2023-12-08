import { Request } from 'express'
import User from './models/shemas/Users.shemas'
import { TokenPayload } from './models/request/Users.request'

declare module 'express' {
  interface Request {
    user?: User
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
    decoded_email_verify_token?: TokenPayload
    decoded_forgot_password_token?: TokenPayload
  }
}

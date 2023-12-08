import { Request, Response } from 'express'
import usersServices from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { LoginReqBody, LogoutReqBody, RegisterReqBody, TokenPayload } from '~/models/request/Users.request'
import User from '~/models/shemas/Users.shemas'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import HTTP_STATUS from '~/constants/httpStatus'
import { UserVerifyStatus } from '~/constants/enums'

const usersServiceInstance = usersServices.getInstance()

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user: User = req.user as User
  const user_id = user._id as ObjectId
  const { accessToken, refreshToken } = await usersServiceInstance.loginService(user_id.toString())
  return res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    userId: user_id,
    accessToken: accessToken,
    refreshToken: refreshToken
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersServiceInstance.registerService(req.body)
  return res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refreshToken } = req.body
  //logout sẽ nhận vào refreshToken và xóa refreshToken đó trong database
  const result = await usersServiceInstance.logoutService(refreshToken)
  return res.json(result)
}

export const emailVerifyTokenController = async (req: Request, res: Response) => {
  const { decoded_email_verify_token } = req.decoded_email_verify_token as TokenPayload
  const user_id = decoded_email_verify_token.user_id as ObjectId
  const user = await usersServiceInstance.getUserById(user_id.toString())
  if (!user) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND
    })
  }
  if (user.email_verify_token === '' || user.verify === UserVerifyStatus.Verified) {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  const result = await usersServiceInstance.emailVerifyTokenService(user_id.toString())
  return res.json({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result
  })
}

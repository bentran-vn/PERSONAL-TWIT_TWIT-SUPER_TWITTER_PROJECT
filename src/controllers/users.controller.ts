import { Request, Response } from 'express'
import usersServices from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { LoginReqBody, LogoutReqBody, RegisterReqBody } from '~/models/request/Users.request'
import User from '~/models/shemas/Users.shemas'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'

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

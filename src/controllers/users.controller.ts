import { Request, Response } from 'express'
import usersServices from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/request/Users.request'

const usersServiceInstance = usersServices.getInstance()

export const loginController = async (req: Request, res: Response) => {
  const { user }: any = req
  const user_id = user._id.toString()
  const [accessToken, refreshToken] = await usersServiceInstance.signAccessAndRefreshToken(user_id)
  res.json({
    message: 'Login successfully',
    userId: user_id,
    accessToken: accessToken,
    refreshToken: refreshToken
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersServiceInstance.registerService(req.body)
  return res.status(201).json({ message: 'User created successfully', result })
}

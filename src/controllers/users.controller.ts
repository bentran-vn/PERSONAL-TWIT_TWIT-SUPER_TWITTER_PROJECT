import { Request, Response } from 'express'
import usersServices from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/request/Users.request'

const usersServiceInstance = usersServices.getInstance()

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  res.json('Hello World')
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  try {
    const result = await usersServiceInstance.registerService(req.body)
    return res.status(201).json({ message: 'User created successfully', result })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ message: 'User created fail', error: 'Internal server error' })
  }
}

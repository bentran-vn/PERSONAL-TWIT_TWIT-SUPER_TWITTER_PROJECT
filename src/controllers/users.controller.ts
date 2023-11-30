import { Request, Response } from 'express'
import usersServices from '~/services/users.services'

const usersServiceInstance = usersServices.getInstance()

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  res.json('Hello World')
}

export const registerController = async (req: Request, res: Response) => {
  const { email, password } = req.body

  try {
    const result = await usersServiceInstance.registerService({ email, password })
    return res.status(201).json({ message: 'User created successfully', result })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ message: 'User created fail', error: 'Internal server error' })
  }
}

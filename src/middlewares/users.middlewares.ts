import { NextFunction, Request, Response } from 'express'

export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Invalid fields' })
  }
  next()
}

export const registerValidator = (req: Request, res: Response, next: NextFunction) => {
  next()
}

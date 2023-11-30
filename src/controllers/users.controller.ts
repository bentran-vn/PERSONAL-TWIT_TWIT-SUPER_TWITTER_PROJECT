import { Request, Response } from 'express'
import Database from '~/database/Database'
import MongodbDatabase from '~/database/MongoDbConnection'
import User from '~/models/shemas/Users.shemas'
const database = Database.getInstance()
const mongodbDatabase = MongodbDatabase.getInstance()

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  res.json('Hello World')
}

export const registerController = async (req: Request, res: Response) => {
  const { email, password } = req.body

  try {
    const result = await database.getUsers(mongodbDatabase).insertOne(
      new User({
        email,
        password
      })
    )
    return res.status(201).json({ message: 'User created successfully', result })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ message: 'User created fail', error: 'Internal server error' })
  }
}

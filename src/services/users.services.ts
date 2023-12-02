import Database from '~/database/Database'
import MongodbDatabase from '~/database/MongoDbConnection'
import { RegisterReqBody } from '~/models/request/Users.request'
import User from '~/models/shemas/Users.shemas'
import { hashPassword } from '~/utils/cryto'

const mongodbDatabase = MongodbDatabase.getInstance()

class usersServices {
  private static instance: usersServices

  private constructor() {}

  public static getInstance(): usersServices {
    if (!usersServices.instance) {
      usersServices.instance = new usersServices()
    }
    return usersServices.instance
  }

  //   async loginService(email: string, password: string) {
  //     return 'Hello World'
  //   }

  async checkEmailService(email: string) {
    const result = await mongodbDatabase.getUsers().findOne({ email })
    return Boolean(result)
  }

  async registerService(payload: RegisterReqBody) {
    try {
      const result = await mongodbDatabase.getUsers().insertOne(
        new User({
          ...payload,
          date_of_birth: new Date(payload.date_of_birth),
          password: hashPassword(payload.password)
        })
      )
      return { message: 'User created successfully', result }
    } catch (error) {
      console.log(error)
      return { message: 'User created fail', error: 'Internal server error' }
    }
  }
}

export default usersServices

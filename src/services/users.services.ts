import Database from '~/database/Database'
import MongodbDatabase from '~/database/MongoDbConnection'
import User from '~/models/shemas/Users.shemas'

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

  async registerService(payload: {
    name: string
    email: string
    password: string
    confirmPassword: string
    date_of_birth: string
  }) {
    const { email, password } = payload
    try {
      const result = await mongodbDatabase.getUsers().insertOne(
        new User({
          email,
          password
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

import { TokenType } from '~/constants/enums'
import Database from '~/database/Database'
import MongodbDatabase from '~/database/MongoDbConnection'
import { RegisterReqBody } from '~/models/request/Users.request'
import User from '~/models/shemas/Users.shemas'
import { hashPassword } from '~/utils/cryto'
import { signToken } from '~/utils/jwt'

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

  //hàm nhận vào userId và bỏ vào payload để tạo Access token
  private signAccessToken(userId: string) {
    return signToken({
      payload: { user_id: userId, token_type: TokenType.Access },
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_MINUTES }
    })
  }
  //hàm nhận vào userId và bỏ vào payload để tạo Refresh token
  private signRefreshToken(userId: string) {
    return signToken({
      payload: { user_id: userId, token_type: TokenType.Refresh },
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_MINUTES }
    })
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
      const userId = result.insertedId.toString()
      const [accessToken, refreshToken] = await Promise.all([
        this.signAccessToken(userId),
        this.signRefreshToken(userId)
      ])
      return { message: 'User created successfully', userId, accessToken, refreshToken }
    } catch (error) {
      console.log(error)
      return { message: 'User created fail', error: 'Internal server error' }
    }
  }
}

export default usersServices

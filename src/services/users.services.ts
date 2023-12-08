import { log } from 'console'
import { ObjectId } from 'mongodb'
import { TokenType } from '~/constants/enums'
import { USERS_MESSAGES } from '~/constants/messages'
import MongodbDatabase from '~/database/MongoDbConnection'
import { RegisterReqBody } from '~/models/request/Users.request'
import RefreshToken from '~/models/shemas/RefreshToken'
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
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_MINUTES }
    })
  }
  //hàm nhận vào userId và bỏ vào payload để tạo Refresh token
  private signRefreshToken(userId: string) {
    return signToken({
      payload: { user_id: userId, token_type: TokenType.Refresh },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_DAYS }
    })
  }
  //hàm nhận vào userId và bỏ vào payload để tạo Email verify token
  private signEmailVerifyToken(userId: string) {
    return signToken({
      payload: { user_id: userId, token_type: TokenType.EmailVerifyToken },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: { expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRE_DAYS }
    })
  }

  async signAccessAndRefreshToken(userId: string) {
    return Promise.all([this.signAccessToken(userId), this.signRefreshToken(userId)])
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
      const user_id = new ObjectId()
      const email_verify_token = await this.signEmailVerifyToken(user_id.toString())
      await mongodbDatabase.getUsers().insertOne(
        new User({
          ...payload,
          _id: user_id,
          date_of_birth: new Date(payload.date_of_birth),
          password: hashPassword(payload.password),
          email_verify_token: email_verify_token
        })
      )
      const [accessToken, refreshToken] = await this.signAccessAndRefreshToken(user_id.toString())
      await mongodbDatabase.getRefreshToken().insertOne(
        new RefreshToken({
          token: refreshToken,
          user_id: new ObjectId(user_id.toString())
        })
      )

      //giả lập gửi mail
      console.log(email_verify_token)
      return { accessToken, refreshToken }
    } catch (error) {
      console.log(error)
      return { message: 'User created fail', error: 'Internal server error' }
    }
  }

  async loginService(userId: string) {
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken(userId)
    await mongodbDatabase.getRefreshToken().insertOne(
      new RefreshToken({
        token: refreshToken,
        user_id: new ObjectId(userId)
      })
    )
    return { accessToken, refreshToken }
  }

  async logoutService(refreshToken: string) {
    await mongodbDatabase.getRefreshToken().deleteOne({ token: refreshToken })
    return { message: USERS_MESSAGES.LOGOUT_SUCCESS }
  }
}

export default usersServices

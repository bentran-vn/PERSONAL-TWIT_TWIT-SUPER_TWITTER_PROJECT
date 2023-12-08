import { log } from 'console'
import { ObjectId } from 'mongodb'
import { TokenType } from '~/constants/enums'
import { USERS_MESSAGES } from '~/constants/messages'
import MongodbDatabase from '~/database/MongoDbConnection'
import { ErrorWithStatus } from '~/models/Error'
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

  async getUserById(userId: string) {
    return Promise.resolve(mongodbDatabase.getUsers().findOne({ _id: new ObjectId(userId) }))
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

  private signEmailForgotPasswordToken(userId: string) {
    return signToken({
      payload: { user_id: userId, token_type: TokenType.ForgotPassword },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: { expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRE_DAYS }
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

  async emailVerifyTokenService(userId: string) {
    await mongodbDatabase.getUsers().updateOne({ _id: new ObjectId(userId) }, [
      {
        $set: {
          email_verify_token: '',
          verify: 1,
          updated_at: '$$NOW'
        }
      }
    ])
    //tạo ra access token và refresh token
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken(userId)
    //lưu refresh token vào database
    await mongodbDatabase.getRefreshToken().insertOne(
      new RefreshToken({
        token: refreshToken,
        user_id: new ObjectId(userId)
      })
    )
    return { accessToken, refreshToken }
  }

  async resendVerifyEmailService(userId: string) {
    try {
      const user_id = new ObjectId()
      const email_verify_token = await this.signEmailVerifyToken(user_id.toString())
      await mongodbDatabase.getUsers().updateOne({ _id: new ObjectId(userId) }, [
        {
          $set: {
            email_verify_token,
            updated_at: '$$NOW'
          }
        }
      ])
      //giả lập gửi mail
      console.log(email_verify_token)
      return { message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS }
    } catch (error) {
      console.log(error)
      throw new ErrorWithStatus({ message: 'User created fail', status: 500 })
    }
  }

  async forgotPasswordService(userId: string) {
    //tạo ra forgot password token
    const forgot_password_token = await this.signEmailForgotPasswordToken(userId)
    //update lại user
    await mongodbDatabase.getUsers().updateOne({ _id: new ObjectId(userId) }, [
      {
        $set: {
          forgot_password_token,
          updated_at: '$$NOW'
        }
      }
    ])
    //giả lập gửi mail
    console.log(forgot_password_token)
    return { message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD }
  }
}

export default usersServices

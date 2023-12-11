import { ObjectId } from 'mongodb'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import MongodbDatabase from '~/database/MongoDbConnection'
import { ErrorWithStatus } from '~/models/Error'
import { RegisterReqBody, UpdateMeReqBody } from '~/models/request/Users.request'
import Follower from '~/models/shemas/Follower.schemas'
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

  async getMe(userId: string) {
    return Promise.resolve(
      mongodbDatabase.getUsers().findOne(
        { _id: new ObjectId(userId) },
        {
          projection: {
            password: 0,
            email_verify_token: 0,
            forgot_password_token: 0,
            verify: 0
          }
        }
      )
    )
  }

  //hàm nhận vào userId và bỏ vào payload để tạo Access token
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.Access, verify },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_MINUTES }
    })
  }
  //hàm nhận vào userId và bỏ vào payload để tạo Refresh token
  private signRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.Refresh, verify },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_DAYS }
    })
  }
  //hàm nhận vào userId và bỏ vào payload để tạo Email verify token
  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.EmailVerifyToken, verify },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: { expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRE_DAYS }
    })
  }

  private signEmailForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.ForgotPassword, verify },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: { expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRE_DAYS }
    })
  }

  async signAccessAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
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
      const email_verify_token = await this.signEmailVerifyToken({
        user_id: user_id.toString(),
        verify: UserVerifyStatus.Unverified
      })
      await mongodbDatabase.getUsers().insertOne(
        new User({
          ...payload,
          _id: user_id,
          username: `user${user_id.toString()}`,
          date_of_birth: new Date(payload.date_of_birth),
          password: hashPassword(payload.password),
          email_verify_token: email_verify_token
        })
      )
      const [accessToken, refreshToken] = await this.signAccessAndRefreshToken({
        user_id: user_id.toString(),
        verify: UserVerifyStatus.Unverified
      })
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

  async loginService({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken({
      user_id,
      verify
    })
    await mongodbDatabase.getRefreshToken().insertOne(
      new RefreshToken({
        token: refreshToken,
        user_id: new ObjectId(user_id)
      })
    )
    return { accessToken, refreshToken }
  }

  async logoutService(refreshToken: string) {
    await mongodbDatabase.getRefreshToken().deleteOne({ token: refreshToken })
    return { message: USERS_MESSAGES.LOGOUT_SUCCESS }
  }

  async emailVerifyTokenService(user_id: string) {
    await mongodbDatabase.getUsers().updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          email_verify_token: '',
          verify: UserVerifyStatus.Verified,
          updated_at: '$$NOW'
        }
      }
    ])
    //tạo ra access token và refresh token
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken({
      user_id,
      verify: UserVerifyStatus.Verified
    })
    //lưu refresh token vào database
    await mongodbDatabase.getRefreshToken().insertOne(
      new RefreshToken({
        token: refreshToken,
        user_id: new ObjectId(user_id)
      })
    )
    return { accessToken, refreshToken }
  }

  async resendVerifyEmailService(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken({
      user_id,
      verify: UserVerifyStatus.Unverified
    })
    await mongodbDatabase.getUsers().updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          email_verify_token,
          updated_at: '$$NOW'
        }
      }
    ])
    //giả lập gửi mail
    console.log(email_verify_token)
    return { message: USERS_MESSAGES.RESEND_EMAIL_VERIFY_SUCCESS }
  }

  async forgotPasswordService({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    //tạo ra forgot password token
    const forgot_password_token = await this.signEmailForgotPasswordToken({
      user_id,
      verify
    })
    //update lại user
    await mongodbDatabase.getUsers().updateOne({ _id: new ObjectId(user_id) }, [
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

  async resetPasswordService({ user_id, password }: { user_id: string; password: string }) {
    //update lại user
    await mongodbDatabase.getUsers().updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          password: hashPassword(password),
          forgot_password_token: '',
          updated_at: '$$NOW'
        }
      }
    ])
    return { message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS }
  }

  async updateMeService(user_id: string, payload: UpdateMeReqBody) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload
    //cập nhập _payload vào database
    const user = await mongodbDatabase.getUsers().findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      [
        {
          $set: {
            ..._payload,
            updated_at: '$$NOW'
          }
        }
      ],
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          verify: 0
        }
      }
    )
    return user
  }

  async getProfileService(username: string) {
    const user = await mongodbDatabase.getUsers().findOne(
      { username },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          verify: 0,
          refresh_tokens: 0,
          created_at: 0,
          updatedd_at: 0
        }
      }
    )
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return user
  }

  async followService(user_id: string, followed_user_id: string) {
    const isFollowed = await mongodbDatabase
      .getFollowers()
      .findOne({ user_id: new ObjectId(user_id), followed_user_id: new ObjectId(followed_user_id) })
    if (isFollowed) {
      return { message: USERS_MESSAGES.FOLLOWED }
    }
    await mongodbDatabase.getFollowers().insertOne(
      new Follower({
        user_id: new ObjectId(user_id),
        followed_user_id: new ObjectId(followed_user_id)
      })
    )
    return { message: USERS_MESSAGES.FOLLOW_SUCCESS }
  }

  async unfollowService(user_id: string, followed_user_id: string) {
    const isFollowed = await mongodbDatabase
      .getFollowers()
      .findOne({ user_id: new ObjectId(user_id), followed_user_id: new ObjectId(followed_user_id) })
    if (!isFollowed) {
      return { message: USERS_MESSAGES.NOT_FOLLOWED }
    }
    await mongodbDatabase
      .getFollowers()
      .deleteOne({ user_id: new ObjectId(user_id), followed_user_id: new ObjectId(followed_user_id) })
    return { message: USERS_MESSAGES.UNFOLLOW_SUCCESS }
  }
}

export default usersServices

import { Request, Response } from 'express'
import usersServices from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  ChangePasswordReqBody,
  FollowReqBody,
  ForgotPasswordReqBody,
  GetProfileReqParams,
  LoginReqBody,
  LogoutReqBody,
  RegisterReqBody,
  TokenPayload,
  UnfollowReqParams,
  UpdateMeReqBody,
  VerifyEmailReqBody
} from '~/models/request/Users.request'
import User from '~/models/shemas/Users.shemas'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import HTTP_STATUS from '~/constants/httpStatus'
import { UserVerifyStatus } from '~/constants/enums'

const usersServiceInstance = usersServices.getInstance()

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user: User = req.user as User
  const user_id = user._id as ObjectId
  const result = await usersServiceInstance.loginService({ user_id: user_id.toString(), verify: user.verify })
  return res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersServiceInstance.registerService(req.body)
  return res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refreshToken } = req.body
  //logout sẽ nhận vào refreshToken và xóa refreshToken đó trong database
  const result = await usersServiceInstance.logoutService(refreshToken)
  return res.json(result)
}

// eslint-disable-next-line prettier/prettier
export const emailVerifyTokenController = async (req: Request<ParamsDictionary, any, VerifyEmailReqBody>, res: Response) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = await usersServiceInstance.getUserById(user_id.toString())
  if (!user) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND
    })
  }
  //nếu mà k khớp email_verify_token thì báo lỗi
  if (user.email_verify_token === '' || user.verify === UserVerifyStatus.Verified) {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  //nếu mà không khớp thì báo lỗi
  if (user.email_verify_token !== req.body.email_verify_token) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_INCORRECT,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
  const result = await usersServiceInstance.emailVerifyTokenService(user_id.toString())
  return res.json({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result
  })
}

export const resendVerifyEmailController = async (req: Request, res: Response) => {
  //nếu vào được đây có nghĩa là access_token hợp lệ
  //và mình đã lấy được decoded_authorization
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await usersServiceInstance.getUserById(user_id.toString())
  if (!user) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND
    })
  }
  if (user.email_verify_token === '' || user.verify === UserVerifyStatus.Verified) {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  if (user.verify === UserVerifyStatus.Banned) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_BANNED,
      status: HTTP_STATUS.FORBIDDEN
    })
  }
  const result = await usersServiceInstance.resendVerifyEmailService(user_id.toString())
  return res.json({
    result
  })
}

export const forgotPasswordController = async (req: Request, res: Response) => {
  const { _id, verify } = req.user as User
  const result = await usersServiceInstance.forgotPasswordService({
    user_id: (_id as ObjectId).toString(),
    verify
  })
  return res.json({
    result
  })
}

export const verifyForgotPasswordTokenController = async (req: Request, res: Response) => {
  return res.json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response
) => {
  //muốn đổi mật khẩu thì cần phải có userId
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { password } = req.body
  //đổi mật khẩu
  const result = await usersServiceInstance.resetPasswordService({ user_id, password })
  return res.json({
    result
  })
}

export const getMeController = async (req: Request, res: Response) => {
  //muốn lấy thông tin của user thì cần phải có userId
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await usersServiceInstance.getMe(user_id)
  return res.json({
    message: USERS_MESSAGES.GET_ME_SUCCESS,
    user
  })
}

export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateMeReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { body: UpdateMeReqBody } = req
  const result = await usersServiceInstance.updateMeService(user_id, UpdateMeReqBody)
  return res.json({
    message: USERS_MESSAGES.UPDATE_ME_SUCCESS,
    result
  })
}

export const getProfileController = async (req: Request<GetProfileReqParams>, res: Response) => {
  const { username } = req.params
  const user = await usersServiceInstance.getProfileService(username)
  return res.json({
    message: USERS_MESSAGES.GET_PROFILE_SUCCESS,
    result: user
  })
}

export const followController = async (req: Request<ParamsDictionary, any, FollowReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { followed_user_id } = req.body
  const result = await usersServiceInstance.followService(user_id, followed_user_id)
  return res.json({
    result
  })
}

export const unfollowController = async (req: Request<UnfollowReqParams>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { followed_user_id } = req.params
  const result = await usersServiceInstance.unfollowService(user_id, followed_user_id)
  return res.json({
    result
  })
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { password } = req.body
  const result = await usersServiceInstance.changePasswordService(user_id, password)
  return res.json({
    result
  })
}

export const refreshTokenController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { refresh_token } = req.body
  const { user_id, verify } = req.decoded_refresh_token as TokenPayload
  const result = await usersServiceInstance.refreshTokenService({ user_id, verify, refresh_token })
  return res.json({
    message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
    result
  })
}

export const oAuthController = async (req: Request, res: Response) => {
  const { code } = req.query
  const { access_token, refresh_token, new_user } = await usersServiceInstance.oAuthService(code as string)
  const urlRedirect = `${process.env.GOOGLE_REDIRECT_CALLBACK}?access_token=${access_token}&refresh_token=${refresh_token}&new_user=${new_user}`
  return res.redirect(urlRedirect)
}

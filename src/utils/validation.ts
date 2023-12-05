import express, { NextFunction, Request, Response } from 'express'
import { validationResult, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import { EntityError, ErrorWithStatus } from '~/models/Error'

export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validation.run(req)
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }
    const errorObject = errors.mapped()
    const entityError = new EntityError({ errors: {} })
    for (const key in errorObject) {
      //Lấy message của từng cái lỗi
      const { msg } = errorObject[key]
      //Nếu msg có dạng ErrorWithStatus và status !== 422 thì nsm cho default handler xử lý
      if (msg instanceof ErrorWithStatus && msg.status !== 422) {
        return next(msg)
      }
      entityError.errors[key] = msg
    }
    //Ở đây xử lý lỗi luôn chứ không ném về Error Default Handler (The biggest)
    next(entityError)
  }
}

import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import usersServices from '~/services/users.services'
import { validate } from '~/utils/validation'

const usersServiceInstance = usersServices.getInstance()

export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Invalid fields' })
  }
  next()
}

export const registerValidator = validate(
  checkSchema({
    name: {
      notEmpty: true,
      isString: true,
      trim: true,
      isLength: {
        errorMessage: 'Name should be at least 3 chars long',
        options: { min: 3 }
      },
      errorMessage: 'Name is required'
    },
    email: {
      notEmpty: true,
      isEmail: true,
      errorMessage: 'Invalid email',
      custom: {
        options: async (value, { req }) => {
          const result = await usersServiceInstance.checkEmailService(value)
          if (result) {
            throw new Error('Email already exists')
          }
          return true
        }
      }
    },
    password: {
      notEmpty: true,
      isString: true,
      trim: true,
      isLength: {
        errorMessage: 'Password should be must in range 8 to 50 chars long',
        options: { min: 8, max: 50 }
      },
      errorMessage: 'Password is required'
    },
    confirmPassword: {
      notEmpty: true,
      isString: true,
      trim: true,
      isLength: {
        errorMessage: 'Password should be must in range 8 to 50 chars long',
        options: { min: 8, max: 50 }
      },
      errorMessage: 'Confirm password is required',
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password')
          }
          return true
        }
      }
    },
    date_of_birth: {
      notEmpty: true,
      isString: true,
      trim: true,
      isISO8601: {
        errorMessage: 'Date of birth must be a date',
        options: {
          strict: true,
          strictSeparator: true
        }
      },
      errorMessage: 'Date of birth is required'
    }
  })
)

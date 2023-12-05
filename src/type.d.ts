import { Request } from 'express'
import User from './models/shemas/Users.shemas'

declare module 'express' {
  interface Request {
    user?: User
  }
}

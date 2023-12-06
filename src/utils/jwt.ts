import jwt from 'jsonwebtoken'
import { TokenPayload } from '~/models/request/Users.request'

//làm hàm nhận vào private key và sau đó kí tên và trả về token

export const signToken = ({
  payload,
  privateKey = process.env.JWT_SECRET as string,
  options = { algorithm: 'HS256' }
}: {
  payload: string | object | Buffer
  privateKey?: string
  options: jwt.SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (err, token) => {
      if (err) {
        throw reject(err)
      } else {
        resolve(token as string)
      }
    })
  })
}

//hàm nhận vào token, và secretOrPulicKey?
export const verifyToken = ({
  token,
  secretOrPulicKey = process.env.JWT_SECRET as string
}: {
  token: string
  secretOrPulicKey?: string
}) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPulicKey, (err, decoded) => {
      if (err) throw reject(err)
      resolve(decoded as TokenPayload)
    })
  })
}

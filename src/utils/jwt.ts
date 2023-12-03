import jwt from 'jsonwebtoken'

//làm hàm nhận vào private key và sau đó kí tên và trả về token

interface signTokenProps {
  payload: string | object | Buffer
  privateKey?: string
  options: jwt.SignOptions
}

export const signToken = ({
  payload,
  privateKey = process.env.JWT_SECRET as string,
  options = { algorithm: 'HS256' }
}: signTokenProps) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (err, token) => {
      if (err) {
        reject(err)
      } else {
        resolve(token as string)
      }
    })
  })
}

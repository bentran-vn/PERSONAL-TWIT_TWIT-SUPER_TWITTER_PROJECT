import { createHash } from 'crypto'

//tạo 1 hàm nhận vào chuỗi làm tham số và trả về chuỗi đã được mã hóa
function sha256(content: string) {
  return createHash('sha256').update(content).digest('hex')
}

export function hashPassword(password: string) {
  return sha256(password + process.env.SALT)
}

interface Error {
  message: string
  status: number
}

export class ErrorWithStatus {
  message: string
  status: number
  constructor({ message, status }: Error) {
    this.message = message
    this.status = status
  }
}

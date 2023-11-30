interface IConnection {
  connectName: string
  connect(): void
  getUsers(): any
}

export default IConnection

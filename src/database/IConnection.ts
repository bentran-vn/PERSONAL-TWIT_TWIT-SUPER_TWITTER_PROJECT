interface IConnection {
  connectString: string
  connectName: string
  connect(): void
}

export default IConnection

import IConnection from './IConnection'

class Database {
  private static instance: Database

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database()
    }

    return Database.instance
  }

  public async connect(IConnection: any) {
    try {
      IConnection.connect()
    } catch (error) {
      console.log(error)
      throw new Error(`Unable to connect to ${IConnection.connectName}.`)
    }
  }
}

export default Database

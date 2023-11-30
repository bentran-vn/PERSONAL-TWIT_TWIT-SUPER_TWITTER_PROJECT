import { MongoClient, Db, Collection } from 'mongodb'
import IConnection from './IConnection'
import User from '~/models/shemas/Users.shemas'

class MongodbDatabase implements IConnection {
  public connectName: string
  private client: MongoClient
  private connectString: string
  private db: Db

  private static instance: MongodbDatabase

  private constructor() {
    this.connectString = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster1.zznsyxx.mongodb.net/?retryWrites=true&w=majority`
    this.connectName = 'MongoDB Atlas'
    this.client = new MongoClient(this.connectString)
    this.db = this.client.db(`${process.env.DB_NAME}`)
  }

  public static getInstance(): MongodbDatabase {
    if (!MongodbDatabase.instance) {
      MongodbDatabase.instance = new MongodbDatabase()
    }

    return MongodbDatabase.instance
  }

  public async connect(): Promise<void> {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log(error)
      throw new Error('Unable to connect to MongoDB Atlas Database.')
    }
  }

  public getUsers(): Collection<User> {
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }
}

export default MongodbDatabase

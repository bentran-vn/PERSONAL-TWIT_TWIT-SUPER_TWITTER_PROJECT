import { MongoClient, Db, Collection } from 'mongodb'
import IConnection from './IConnection'
import User from '~/models/shemas/Users.shemas'
import RefreshToken from '~/models/shemas/RefreshToken'
import Follower from '~/models/shemas/Follower.schemas'
import MONGODB from './MongoDbUtil'

class MongodbDatabase implements IConnection {
  public connectName: string
  private client: MongoClient
  private connectString: string
  public db: Db

  private static instance: MongodbDatabase

  private constructor() {
    this.connectString = `mongodb+srv://${MONGODB.username}:${MONGODB.password}@cluster1.zznsyxx.mongodb.net/?retryWrites=true&w=majority`
    this.connectName = 'MongoDB Atlas'
    this.client = new MongoClient(this.connectString)
    this.db = this.client.db(`${MONGODB.dbName}`)
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

  public getRefreshToken(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
  }

  public getFollowers(): Collection<Follower> {
    return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION as string)
  }
}

export default MongodbDatabase

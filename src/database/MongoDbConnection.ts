import { MongoClient } from 'mongodb'
import IConnection from './IConnection'

class MongodbDatabase implements IConnection {
  connectString: string
  connectName: string
  client: MongoClient

  constructor() {
    this.connectString = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster1.zznsyxx.mongodb.net/?retryWrites=true&w=majority`
    this.connectName = 'MongoDB Atlas'
    this.client = new MongoClient(this.connectString)
  }

  async connect(): Promise<void> {
    try {
      await this.client.db(`${process.env.DB_NAME}`).command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log(error)
      throw new Error('Unable to connect to MongoDB Atlas Database.')
    }
  }
}

export default MongodbDatabase

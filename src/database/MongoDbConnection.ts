import { MongoClient } from 'mongodb'
import IConnection from './IConnection'

class MongodbDatabase implements IConnection {
  connectString: string
  connectName: string
  client: MongoClient

  constructor() {
    this.connectString = 'mongodb+srv://sa:12345@cluster1.zznsyxx.mongodb.net/?retryWrites=true&w=majority'
    this.connectName = 'MongoDB Atlas'
    this.client = new MongoClient(this.connectString)
  }

  async connect(): Promise<void> {
    try {
      await this.client.db('admin').command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log(error)
      throw new Error('Unable to connect to MongoDB Atlas Database.')
    }
  }
}

export default MongodbDatabase

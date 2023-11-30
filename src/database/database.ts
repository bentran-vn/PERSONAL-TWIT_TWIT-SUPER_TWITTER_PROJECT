import { MongoClient } from 'mongodb'
const uri = 'mongodb+srv://sa:12345@cluster1.zznsyxx.mongodb.net/?retryWrites=true&w=majority'

const client = new MongoClient(uri)

export async function run() {
  try {
    await client.db('admin').command({ ping: 1 })
    console.log('Pinged your deployment. You successfully connected to MongoDB!')
  } catch (error) {
    console.log(error)
  }
}

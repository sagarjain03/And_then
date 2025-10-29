import { MongoClient, type Db } from "mongodb"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local")
}

const uri = process.env.MONGODB_URI
const options = {}

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const client = new MongoClient(uri, options)
  await client.connect()
  const db = client.db("storyweave")

  cachedClient = client
  cachedDb = db

  return { client, db }
}

export async function getDatabase() {
  const { db } = await connectToDatabase()
  return db
}

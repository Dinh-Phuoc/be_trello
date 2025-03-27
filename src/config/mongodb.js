import { MongoClient, ServerApiVersion } from 'mongodb'

import { env } from './environment'

let trelloDatabaseInstance = null

const clientInstance = new MongoClient(env.MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
})

export const CONNECT_DB = async () => {
    await clientInstance.connect()
    trelloDatabaseInstance = clientInstance.db(env.DATABASE_NAME)
}

export const CLOSE_DB = async () => {
    console.log('Closed database')
    clientInstance.close()
}

export const GET_DB = () => {
    if (!trelloDatabaseInstance) throw new Error('Must connect to Database first!')
    return trelloDatabaseInstance
}
import { MongoClient, ServerApiVersion } from 'mongodb'
const dns = require('dns');

import { env } from './environment'

let trelloDatabaseInstance = null

dns.setServers(['8.8.8.8', '1.1.1.1']);
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

    // Tạo unique index cho email + googleId (chạy 1 lần, MongoDB sẽ skip nếu đã tồn tại)
    const usersCollection = trelloDatabaseInstance.collection('users')
    await usersCollection.createIndex({ email: 1 }, { unique: true })

    // Chỉ unique khi googleId tồn tại và không rỗng (cho phép nhiều user có googleId = '')
    // Lưu ý: MongoDB không cho phép dùng cả `sparse` và `partialFilterExpression` cùng lúc
    try {
        // Drop index cũ nếu tồn tại (đã tạo với config sai từ trước)
        await usersCollection.dropIndex('googleId_1')
    } catch (err) {
        // Index không tồn tại hoặc không thuộc collection - bỏ qua
        if (err.codeName !== 'IndexNotFound') {
            console.warn('Không thể drop index googleId_1:', err.message)
        }
    }
    await usersCollection.createIndex(
        { googleId: 1 },
        { unique: true, partialFilterExpression: { googleId: { $type: 'string', $gt: '' } } }
    )
}

export const CLOSE_DB = async () => {
    clientInstance.close()
}

export const GET_DB = () => {
    if (!trelloDatabaseInstance) throw new Error('Must connect to Database first!')
    return trelloDatabaseInstance
}
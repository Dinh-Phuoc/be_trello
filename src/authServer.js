/* eslint-disable no-console */
import express from 'express'
import { CLOSE_DB, CONNECT_DB } from './config/mongodb'
import { env } from './config/environment'
import exitHook from 'async-exit-hook'
import { corsOptions } from './config/cors'
import cors from 'cors'
import { errorHandlingMiddleware } from './middlewares/errorHandingMiddleware'
import { userRoute } from './routes/v1/userRoute'
import cookieParser from 'cookie-parser'
import { authLimiter, registerLimiter } from './middlewares/rateLimiter'
import { closeRedis, waitForRedisReady } from './config/redis'

const START_SERVER = () => {
    const app = express ()

    app.use(cookieParser())

    app.use(cors(corsOptions))

    app.use(express.json())

    // Áp dụng rate limiter cho /auth (chống brute force)
    // - Login: 5 attempts/15min
    // - Register: 3 attempts/hour
    // Áp dụng theo path cụ thể thay vì /auth để control chi tiết
    app.use('/auth/login', authLimiter)
    app.use('/auth/register', registerLimiter)
    app.use('/auth', userRoute)

    app.use(errorHandlingMiddleware)

    app.listen(env.AUTHOR_PORT, () => {
        console.log(`Server is listening at ${env.AUTHOR_PORT}`)
    })

    exitHook( async() => {
        console.log('The database is disconnected')
        await CLOSE_DB()
        await closeRedis()
    })
}

(async () => {
    try {
        // ===== Bước 1: Kết nối DB =====
        await CONNECT_DB()
        console.log('Connect to the database successfully!')

        // ===== Bước 2: Đợi Redis ready =====
        // Tại sao cần đợi:
        // - rate-limit-redis RedisStore.init() cần gửi command EVALSHA ngay khi khởi tạo
        // - Nếu Redis chưa "ready", init() sẽ throw "Stream isn't writeable"
        // - Giải pháp: đợi Redis báo "ready" trước khi mount routes (chứa rateLimiter)
        await waitForRedisReady()
        console.log('Redis is ready')

        // ===== Bước 3: Start server (mount routes) =====
        START_SERVER()
    } catch (err) {
        console.error('Startup failed:', err)
        process.exit(1)
    }
})()
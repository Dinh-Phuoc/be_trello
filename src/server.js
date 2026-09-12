/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import { corsOptions, allowCorsForImage } from './config/cors'
import exitHook from 'async-exit-hook'
import path from 'path'

import { CONNECT_DB, CLOSE_DB } from './config/mongodb'
import { env } from './config/environment'
import { APIs_V1 } from './routes/v1'
import { errorHandlingMiddleware } from './middlewares/errorHandingMiddleware'
import { userController } from './controllers/userController'
import cookieParser from 'cookie-parser'
import authorizationMiddleware from './middlewares/authorizationMiddleware'
import { cardController } from './controllers/cardController'
import { apiLimiter } from './middlewares/rateLimiter'
import { closeRedis, waitForRedisReady } from './config/redis'

const START_SERVER = () => {
    const app = express()

    app.enable('trust proxy')

    app.use(cookieParser())

    app.get('/v1/manage/users/profile/get-image/avatar', cors(allowCorsForImage), authorizationMiddleware, userController.getAvatar)
    app.get('/v1/manage/users/profile/get-image/image-header', cors(allowCorsForImage), authorizationMiddleware, userController.getImageHeader)
    app.get('/v1/cards/get-image/card-cover/:carduuid', cors(allowCorsForImage), authorizationMiddleware, cardController.getCardCover)

    app.use(cors(corsOptions))

    app.use('/uploads', express.static(path.join(__dirname, 'upload')))

    app.use(express.json())

    // Áp dụng API rate limiter cho tất cả /v1 routes (100 req/15min)
    app.use('/v1', apiLimiter, APIs_V1)

    //Middleware
    app.use(errorHandlingMiddleware)

    if (env.BUILD_MODE === 'prod') {
        app.listen(env.APP_PORT, () => {
            console.log(`Production: Hello Sariii, You are running at ${ env.APP_PORT }/`)
        })
    } else {
        app.listen(env.APP_PORT, env.APP_HOST, () => {
            console.log(`Dev: Hello Sariii, You are running at ${ env.APP_HOST }:${ env.APP_PORT }/`)
        })
    }

    exitHook(async () => {
        console.log('Server is Shutting Down')
        await CLOSE_DB()
        await closeRedis()
    })
}

(async () => {
    try {
        // ===== Bước 1: Kết nối DB =====
        await CONNECT_DB()
        console.log('Connect to database')

        // ===== Bước 2: Đợi Redis ready =====
        // rate-limit-redis cần Redis ready trước khi mount routes
        await waitForRedisReady()
        console.log('Redis is ready')

        // ===== Bước 3: Start server =====
        START_SERVER()
    } catch (err) {
        console.error('Startup failed:', err)
        process.exit(1)
    }
})()
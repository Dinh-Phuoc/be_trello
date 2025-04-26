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
const START_SERVER = () => {
    const app = express()

    app.enable('trust proxy')

    app.get('/v1/manage/users/profile/get-image/avatar/:id', cors(allowCorsForImage), userController.getAvatar)
    app.get('/v1/manage/users/profile/get-image/image-header/:id', cors(allowCorsForImage), userController.getImageHeader)

    app.use(cors(corsOptions))

    app.use('/uploads', express.static(path.join(__dirname, 'upload')))

    app.use(express.json())

    app.use('/v1', APIs_V1)

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
    })
}

CONNECT_DB()
    .then(() => console.log('Connect to database'))
    .then(() => START_SERVER())
    .catch(err => {
        console.error('Error connecting to database:', err)
        process.exit(0)
    })
/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import { corsOptions } from './config/cors'
import exitHook from 'async-exit-hook'

import { CONNECT_DB, CLOSE_DB } from './config/mongodb'
import { env } from './config/environment'
import { APIs_V1 } from './routes/v1'
import { errorHandlingMiddleware } from './middlewares/errorHandingMiddleware'
const START_SERVER = () => {
    const app = express()

    app.use(cors(corsOptions))


    app.use(express.json())

    app.use('/v1', APIs_V1)

    //Middleware
    app.use(errorHandlingMiddleware)

    if (env.BUILD_MODE === 'prod') {
        app.listen(process.env.PORT, () => {
            console.log(`Production: Hello Sariii, You are running at ${ process.env.PORT }/`)
        })
    } else {
        app.listen(env.APP_PORT, env.APP_HOST, () => {
            console.log(`Dev: Hello Sariii, You are running at ${ env.APP_HOST }:${ env.APP_PORT }/`)
        })
    }

    exitHook(async () => {
        console.log('Server is Shutting Down')
        await CLOSE_DB()
        console.log('Absolute disconnect')
    })
}

CONNECT_DB()
    .then(() => console.log('Connect to database'))
    .then(() => START_SERVER())
    .catch(err => {
        console.error('Error connecting to database:', err)
        process.exit(0)
    })
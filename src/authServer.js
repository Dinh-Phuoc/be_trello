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

const START_SERVER = () => {
    const app = express ()

    app.use(cookieParser())

    app.use(cors(corsOptions))

    app.use(express.json())

    app.use('/auth', userRoute)

    app.use(errorHandlingMiddleware)

    app.listen(env.AUTHOR_PORT, () => {
        console.log(`Server is listening at ${env.AUTHOR_PORT}`)
    })

    exitHook( async() => {
        console.log('The database is disconnected')
        await CLOSE_DB()
    })
}

CONNECT_DB()
    .then(() => {
        console.log('Connect to the database successfully!')
    })
    .then(() => {
        START_SERVER()
    })
    .catch(err => {
        console.error('Error connecting to database:', err)
        process.exit(0)
    })
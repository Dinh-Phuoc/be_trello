/* eslint-disable no-console */
import express from 'express'
import { CONNECT_DB, GET_DB, CLOSE_DB } from './config/mongodb'
import exitHook from 'async-exit-hook'

import { env } from './config/environment'
const START_SERVER = () => {
    const app = express()

    app.get('/', async (req, res) => {
        console.log(await GET_DB().listCollections().toArray())

        res.end('<h1>Hello World!</h1><hr>')
    })

    app.listen(env.APP_PORT, env.APP_HOST, () => {
        console.log(`Hello Sariii, You are running at ${ env.APP_HOST }:${ env.APP_PORT }/`)
    })

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
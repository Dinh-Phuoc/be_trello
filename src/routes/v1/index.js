import express from 'express'
import { StatusCodes } from 'http-status-codes'

import { boardRoute } from './boardRoute'

const Router = express.Router()

//check APIs v1/status
Router.get('/status', (req, res) => {
    res.status(StatusCodes.OK).json({ message: 'APIs V1 are ready to use!' })
})

Router.use('/boards', boardRoute)

export const APIs_V1 = Router
import express from 'express'
import { StatusCodes } from 'http-status-codes'

import { boardRoute } from './boardRoute'
import { columnRoute } from './columnRoute'
import { cardRoute } from './cardRoute'
import { loginRoute } from './loginRoute'
import { registerRoute } from './registerRoute'
import { profileRoute } from './profileRoute'

const Router = express.Router()

//check APIs v1/status
Router.get('/status', (req, res) => {
    res.status(StatusCodes.OK).json({ message: 'APIs V1 are ready to use!' })
})

Router.use('/boards', boardRoute)
Router.use('/columns', columnRoute)
Router.use('/cards', cardRoute)
Router.use('/login', loginRoute)
Router.use('/register', registerRoute)
Router.use('/profile', profileRoute)

export const APIs_V1 = Router
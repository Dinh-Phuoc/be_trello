import express from 'express'

import { profileController } from '~/controllers/profileController'

const Router = express.Router()

Router.route('/')
    .get(profileController.getInfo)

export const profileRoute = Router
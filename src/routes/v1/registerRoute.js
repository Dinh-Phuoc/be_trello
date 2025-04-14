import express from 'express'

import { registerValidation } from '~/validations/registerValidation'
import { registerController } from '~/controllers/registerController'

const Router = express.Router()

Router.route('/')
    .post(registerValidation.register, registerController.register)

export const registerRoute = Router
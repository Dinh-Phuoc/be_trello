import express from 'express'

import { loginValidation } from '~/validations/loginValidation'
import { loginController } from '~/controllers/loginController'

const Router = express.Router()

Router.route('/')
    .post(loginValidation.login, loginController.login)

export const loginRoute = Router
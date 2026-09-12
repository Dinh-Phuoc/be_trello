import express from 'express'
import { userController } from '~/controllers/userController'
import { googleController } from '~/controllers/googleController'
import authorizationMiddleware from '~/middlewares/authorizationMiddleware'
import { uploadImageMiddleware } from '~/middlewares/uploadImageMiddleware'
import { authLimiter, registerLimiter, googleLimiter } from '~/middlewares/rateLimiter'

import { userValidation } from '~/validations/userValidation'
import { googleValidation } from '~/validations/googleValidation'

const Router = express.Router()

//---------------------Authentication----------------------//

Router.route('/login')
    .post(userValidation.login, userController.login)

Router.route('/logout')
    .delete(authorizationMiddleware, userController.logout)

Router.route('/register')
    .post(userValidation.register, userController.register)

Router.route('/refresh')
    .post(userController.refresh)

//---------------------Google OAuth---------------------------//

Router.route('/google')
    .post(googleValidation.loginGoogle, googleLimiter, googleController.loginGoogle)

//---------------------Get Profile---------------------------//

Router.route('/profile')
    .get(authorizationMiddleware, userController.getInfo)

//---------------------Update Profile-------------------------//

Router.route('/profile/update/:fieldName')
    .patch(authorizationMiddleware, userValidation.updateProfile, userController.updateProfile)

//---------------------Update Images-------------------------//

Router.route('/profile/upload/image-header')
    .patch(
        authorizationMiddleware,
        uploadImageMiddleware.uploadImageHeader.single('image-header'),
        userController.uploadImageHeader)

Router.route('/profile/upload/avatar')
    .patch(
        authorizationMiddleware,
        uploadImageMiddleware.uploadAvatar.single('avatar'),
        userController.uploadAvatar
    )

export const userRoute = Router
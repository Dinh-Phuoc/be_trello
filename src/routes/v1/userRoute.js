import express from 'express'
import { userController } from '~/controllers/userController'
import authorizationMiddleware from '~/middlewares/authorizationMiddleware'
import { uploadImageMiddleware } from '~/middlewares/uploadImageMiddleware'

import { userValidation } from '~/validations/userValidation'

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

//---------------------------------------------------------//
Router.route('/profile')
    .get(authorizationMiddleware, userController.getInfo)

Router.route('/profile/update/:fieldName')
    .patch(authorizationMiddleware, userValidation.updateProfile, userController.updateProfile)

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
import express from 'express'
import { userController } from '~/controllers/userController'
import authorizationMiddleware from '~/middlewares/authorizationMiddleware'
import { uploadImageMiddleware } from '~/middlewares/uploadImageMiddleware'

import { userValidation } from '~/validations/userValidation'

const Router = express.Router()

Router.route('/login')
    .post(userValidation.login, userController.login)

Router.route('/register')
    .post(userValidation.register, userController.register)

Router.route('/profile')
    .get(userController.getInfo)

Router.route('/profile/update/:id/:fieldName')
    .patch(authorizationMiddleware, userValidation.updateProfile, userController.updateProfile)

Router.route('/profile/upload/image-header/:id')
    .patch(
        authorizationMiddleware,
        uploadImageMiddleware.uploadImageHeader.single('image-header'),
        userController.uploadImageHeader)

Router.route('/profile/get-image/image-header/:id/')
    .get(userController.getImageHeader)

Router.route('/profile/upload/avatar/:id')
    .patch(
        authorizationMiddleware,
        uploadImageMiddleware.uploadAvatar.single('avatar'),
        userController.uploadAvatar
    )

Router.route('/profile/get-image/avatar/:id/')
    .get(userController.getAvatar)

export const userRoute = Router
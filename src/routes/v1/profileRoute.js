import express from 'express'

import { profileController } from '~/controllers/profileController'
import { uploadImageController } from '~/controllers/uploadImageController'
import { uploadImageMiddleware } from '~/middlewares/uploadImageMiddleware'

const Router = express.Router()

Router.route('/')
    .get(profileController.getInfo)

Router.route('/upload/image-header/:id')
    .post(uploadImageMiddleware.uploadImageHeader.single('image-header'), uploadImageController.uploadFile)
Router.route('/upload/avatar/:id')
    .post(uploadImageMiddleware.uploadAvatar.single('avatar'), uploadImageController.uploadFile)

export const profileRoute = Router
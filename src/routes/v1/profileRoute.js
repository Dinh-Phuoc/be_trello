import express from 'express'

import { profileController } from '~/controllers/profileController'
import { uploadImageController } from '~/controllers/uploadImageController'
import { uploadImageMiddleware } from '~/middlewares/uploadImageMiddleware'

const Router = express.Router()

Router.route('/')
    .get(profileController.getInfo)

Router.route('/upload/image-header/:id')
    .patch(uploadImageMiddleware.uploadImageHeader.single('image-header'), uploadImageController.uploadImageHeader)
Router.route('/getImage/image-header/:id/')
    .get(uploadImageController.getImageHeader)

Router.route('/upload/avatar/:id')
    .patch(uploadImageMiddleware.uploadAvatar.single('avatar'), uploadImageController.uploadAvatar)
Router.route('/getImage/avatar/:id/')
    .get(uploadImageController.getAvatar)
export const profileRoute = Router
import express from 'express'

import { cardValidation } from '~/validations/cardValidation'
import { cardController } from '~/controllers/cardController'
import authorizationMiddleware from '~/middlewares/authorizationMiddleware'
import { uploadImageMiddleware } from '~/middlewares/uploadImageMiddleware'

const Router = express.Router()

Router.route('/')
    .post(cardValidation.createNew, cardController.createNew)

Router.route('/upload/image-header-card/:carduuid/:useruuid')
    .post(
        authorizationMiddleware,
        uploadImageMiddleware.uploadImageHeaderCard.single('image-header-card'),
        cardController.uploadImageHeaderCard
    )

export const cardRoute = Router
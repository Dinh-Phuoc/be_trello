import express from 'express'

import { cardValidation } from '~/validations/cardValidation'
import { cardController } from '~/controllers/cardController'
import authorizationMiddleware from '~/middlewares/authorizationMiddleware'
import { uploadImageMiddleware } from '~/middlewares/uploadImageMiddleware'

const Router = express.Router()

Router.route('/')
    .post(cardValidation.createNew, cardController.createNew)

Router.route('/upload/card-cover/:cardUuid')
    .patch(
        authorizationMiddleware,
        uploadImageMiddleware.uploadCardCover.single('card-cover'),
        cardController.uploadCardCover
    )

export const cardRoute = Router
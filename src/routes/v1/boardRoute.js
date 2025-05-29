import express from 'express'

import { boardValidation } from '~/validations/boardValidation'
import { boardController } from '~/controllers/boardController'
import authorizationMiddleware from '~/middlewares/authorizationMiddleware'

const Router = express.Router()

Router.route('/')
    .post(boardValidation.createNew, boardController.createNew)

Router.route('/:uuid')
    .get(authorizationMiddleware, boardController.getDetails)
    .put(authorizationMiddleware, boardValidation.update, boardController.update)


Router.route('/supports/moving_cards')
    .put(boardValidation.moveCardToDifferentColumn, boardController.moveCardToDifferentColumn)

export const boardRoute = Router
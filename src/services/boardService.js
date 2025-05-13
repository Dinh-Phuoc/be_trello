import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import ApiError from '~/utils/ApiError'
import { slugify } from '~/utils/formartter'

const createNew = async (reqBody) => {
    const newBoard = {
        ...reqBody,
        slug: slugify(reqBody.title)
    }
    const createdBoard = await boardModel.createNew(newBoard)
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)

    return getNewBoard
}

const getDetails = async (boardUuid) => {
    const board = await boardModel.getDetails(boardUuid)
    if (!board) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    const resBoard = cloneDeep(board)
    resBoard.columns.forEach(column => {
        column.cards = resBoard.cards.filter(card => card.columnUuid === column.uuid)
    })

    delete resBoard.cards

    return resBoard
}

const update = async (boardId, reqBody) => {
    const updateData = {
        ...reqBody,
        updatedAt: Date.now()
    }
    const updatedBoard = await boardModel.update(boardId, updateData)

    return updatedBoard
}

const moveCardToDifferentColumn = async (reqBody) => {
    //Update the old cardOrderIds array
    await columnModel.update(reqBody.oldColumnId, {
        cardOrderIds: reqBody.oldCardOrderIds,
        updatedAt: Date.now()
    })
    //Update the new cardOrderIds array
    await columnModel.update(reqBody.newColumnId, {
        cardOrderIds: reqBody.newCardOrderIds,
        updatedAt: Date.now()
    })

    await cardModel.update(reqBody.currentCardId, {
        columnUuid: reqBody.newColumnId
    })

    return { updateMessage: 'Success' }
}

export const boardService = {
    createNew,
    getDetails,
    update,
    moveCardToDifferentColumn
}
import { StatusCodes } from 'http-status-codes'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import ApiError from '~/utils/ApiError'

const createNew = async (reqBody) => {
    const newColumn = {
        ...reqBody
    }
    const createdColumn = await columnModel.createNew(newColumn)
    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)

    if (getNewColumn) {
        getNewColumn.cards = []

        await boardModel.pushColumnOrderIds(getNewColumn)
    }

    return getNewColumn
}

const update = async (columnId, reqBody) => {
    const updateData = {
        ...reqBody,
        updatedAt: Date.now()
    }
    const updatedColumn = await columnModel.update(columnId, updateData)

    return updatedColumn
}


const deleteColumn = async (columnId) => {
    const targetColumn = await columnModel.findOneById(columnId)
    console.log('🚀 ~ deleteColumn ~ targetColumn:', targetColumn)

    if (!targetColumn) throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found')

    await columnModel.deleteOneById(columnId)
    await cardModel.deleteManyByColumnId(columnId)
    await boardModel.pullColumnOrderIds(targetColumn)
    return { deleteMessage: 'Column deleted !!!' }
}
export const columnService = {
    createNew,
    update,
    deleteColumn
}
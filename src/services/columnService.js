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

const update = async (columnUuid, reqBody) => {
    const updateData = {
        ...reqBody,
        updatedAt: Date.now()
    }
    const updatedColumn = await columnModel.update(columnUuid, updateData)

    return updatedColumn
}


const deleteColumn = async (columnUuid) => {
    const targetColumn = await columnModel.findOneByUuid(columnUuid)

    if (!targetColumn) throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy cột cần xóa')

    await columnModel.deleteOneById(columnUuid)
    await cardModel.deleteManyByColumnId(columnUuid)
    await boardModel.pullColumnOrderIds(targetColumn)
    return { deleteMessage: 'Column deleted !!!' }
}
export const columnService = {
    createNew,
    update,
    deleteColumn
}
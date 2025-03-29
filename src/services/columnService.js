import { boardModel } from '~/models/boardModel'
import { columnModel } from '~/models/columnModel'

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

export const columnService = {
    createNew,
    update
}
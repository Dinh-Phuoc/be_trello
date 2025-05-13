import { StatusCodes } from 'http-status-codes'
import { columnService } from '~/services/columnService'

const createNew = async (req, res, next) => {
    try {
        const createColumn = await columnService.createNew(req.body)
        res.status(StatusCodes.CREATED).json(createColumn)
    } catch (error) {
        next(error)
    }
}

const update = async (req, res, next) => {
    try {
        const columnUuid = req.params.uuid
        const updateColumn = await columnService.update(columnUuid, req.body)
        res.status(StatusCodes.OK).json(updateColumn)
    } catch (error) {
        next(error)
    }
}

const deleteColumn = async (req, res, next) => {
    try {
        const columnId = req.params.uuid
        const result = await columnService.deleteColumn(columnId)
        res.status(StatusCodes.OK).json(result)
    } catch (error) {
        next(error)
    }
}
export const columnController = {
    createNew,
    update,
    deleteColumn
}
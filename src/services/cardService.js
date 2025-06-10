import jwt from 'jsonwebtoken'
import { env } from '~/config/environment'
import path from 'path'

import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'

const createNew = async (reqBody) => {
    const newCard = {
        ...reqBody
    }
    const createdCard = await cardModel.createNew(newCard)
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)

    if (getNewCard) {
        await columnModel.pushCardOrderIds(getNewCard)
    }

    return getNewCard
}

const update = async (fieldName, cardUuid, token, data) => {
    try {
        const decoded = jwt.verify(token, env.SECRETKEY)
        const updateData = {
            data,
            updateBy: decoded.uuid,
            updatedAt: Date.now()
        }
        const res = await cardModel.updateOne(fieldName, cardUuid, updateData)
        return res
    } catch (error) {
        return error
    }
}

const getOne = async(fieldName, cardUuid) => {
    try {
        if (fieldName === 'cover') {
            const result = await cardModel.getOne(fieldName, cardUuid)
            const filePath = path.join(__dirname, `../uploads/card-cover/${cardUuid}/`, result)
            return filePath
        }

        const getOne = await cardModel.getOne(fieldName, cardUuid)
        return getOne[fieldName]
    } catch (error) {
        return error
    }
}

export const cardService = {
    createNew,
    getOne,
    update
}
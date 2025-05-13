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

const update = async (fieldName, cardUuid, userUuid, data) => {
    const dataUpdate = {
        ...data,
        updatedAt: Date().now(),
        updateBy: userUuid
    }
    const res = await cardModel.updateOne(fieldName, cardUuid, userUuid, dataUpdate)
    return res
}

export const cardService = {
    createNew,
    update
}
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

export const cardService = {
    createNew
}
import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const INVALID_UPDATE_FIELD = ['_id', 'boardId', 'createdAt']
// Define Collection (name & schema)
const CARD_COLLECTION_NAME = 'cards'
const CARD_COLLECTION_SCHEMA = Joi.object({
    boardUuid: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    uuid: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    columnUuid: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().required().min(3).max(50).trim().strict(),

    description: Joi.string().optional(),

    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null),
    _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
    return await CARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
    try {
        const validData = await validateBeforeCreate(data)
        return await GET_DB().collection(CARD_COLLECTION_NAME).insertOne({
            ...validData,
            boardUuid: validData.boardUuid,
            columnUuid: validData.columnUuid
        })
    } catch (error) {
        throw new Error(error)
    }
}

const findOneById = async (id) => {
    try {
        return await GET_DB().collection(CARD_COLLECTION_NAME).findOne({
            _id: new ObjectId(id)
        })
    } catch (error) {
        throw new Error(error)
    }
}

const update = async (cardId, updateData) => {
    try {
        Object.keys(updateData).forEach(fieldName => {
            if (INVALID_UPDATE_FIELD.includes(fieldName)) {
                delete updateData[fieldName]
            }
        })

        const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
            { uuid: cardId },
            { $set: updateData },
            { returnDocument: 'after' }
        )
        return result
    } catch (error) {
        throw new Error(error)
    }
}
const updateOne = async(fieldName, cardUuid, updateData) => {
    try {
        Object.keys(updateData).forEach(fieldName => {
            if (INVALID_UPDATE_FIELD.includes(fieldName)) {
                delete updateData[fieldName]
            }
        })

        const messageUpload = await GET_DB().collection(CARD_COLLECTION_NAME).updateOne(
            { uuid: cardUuid },
            { $set: {
                [fieldName]: updateData.data,
                updateBy: updateData.updateBy,
                updatedAt: updateData.updatedAt
            } }
        )
        return messageUpload
    } catch (error) {
        throw new Error(error)
    }
}

const deleteManyByColumnId = async (columnUuid) => {
    try {
        const rs = await GET_DB().collection(CARD_COLLECTION_NAME).deleteMany({
            columnUuid: columnUuid
        })
        return rs
    } catch (error) {
        throw new Error(error)
    }
}

const getOne = async(fieldName, cardUuid) => {
    try {
        const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOne({
            uuid: cardUuid
        })

        return result[fieldName]
    } catch (error) {
        throw Error(error)
    }
}
export const cardModel = {
    CARD_COLLECTION_NAME,
    CARD_COLLECTION_SCHEMA,
    createNew,
    findOneById,
    update,
    updateOne,
    getOne,
    deleteManyByColumnId
}
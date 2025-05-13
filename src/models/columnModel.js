import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const INVALID_UPDATE_FIELD = ['_id', 'boardId', 'createdAt']
const COLUMN_COLLECTION_NAME = 'columns'
const COLUMN_COLLECTION_SCHEMA = Joi.object({
    boardUuid: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().required().min(3).max(50).trim().strict(),
    uuid: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

    cardOrderIds: Joi.array().items(
        Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ).default([]),

    role: Joi.string().default('guest'),
    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null),
    _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
    return await COLUMN_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
    try {
        const validData = await validateBeforeCreate(data)
        return await GET_DB().collection(COLUMN_COLLECTION_NAME).insertOne({
            ...validData,
            boardUuid: validData.boardUuid
        })
    } catch (error) {
        throw new Error(error)
    }
}

const findOneById = async (id) => {
    try {
        return await GET_DB().collection(COLUMN_COLLECTION_NAME).findOne({
            _id: new ObjectId(id)
        })
    } catch (error) {
        throw new Error(error)
    }
}

const findOneByUuid = async (id) => {
    try {
        return await GET_DB().collection(COLUMN_COLLECTION_NAME).findOne({ uuid: id })
    } catch (error) {
        throw new Error(error)
    }
}

const pushCardOrderIds = async (card) => {
    try {
        const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
            { _id: new ObjectId(card.columnId) },
            { $push: { cardOrderIds: new ObjectId(card._id) } },
            { returnDocument: 'after' }
        )
        return result
    } catch (error) {
        throw new Error(error)
    }
}
const update = async (columnUuid, updateData) => {
    try {
        Object.keys(updateData).forEach(fieldName => {
            if (INVALID_UPDATE_FIELD.includes(fieldName)) {
                delete updateData[fieldName]
            }
        })
        if (updateData.cardOrderIds) {
            updateData.cardOrderIds = updateData.cardOrderIds.map(uuid => uuid)
        }

        const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
            { uuid: columnUuid },
            { $set: updateData },
            { returnDocument: 'after' }
        )
        return result
    } catch (error) {
        throw new Error(error)
    }
}

const deleteOneById = async (uuid) => {
    try {
        return await GET_DB().collection(COLUMN_COLLECTION_NAME).deleteOne({
            uuid: uuid
        })
    } catch (error) {
        throw new Error(error)
    }
}
export const columnModel = {
    COLUMN_COLLECTION_NAME,
    COLUMN_COLLECTION_SCHEMA,
    createNew,
    findOneById,
    findOneByUuid,
    pushCardOrderIds,
    update,
    deleteOneById
}
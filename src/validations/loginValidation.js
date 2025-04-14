import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'

import ApiError from '~/utils/ApiError'

const login = async (req, res, next) => {
    const correctCondition = Joi.object({
        userName: Joi.string().required().min(6).trim().strict(),
        password: Joi.string().required().min(6).trim().strict()
    })

    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false })
        next()
    } catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
    }
}

export const loginValidation = {
    login
}
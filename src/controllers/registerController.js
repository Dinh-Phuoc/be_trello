import { StatusCodes } from 'http-status-codes'
import { registerService } from '~/services/registerService'

const register = async (req, res, next) => {
    try {
        const messageRegister = await registerService.register(req.body)
        res.status(StatusCodes.OK).json(messageRegister)
    } catch (error) {
        next(error)
    }
}
export const registerController = {
    register
}
import { Router } from 'express'
import { uploadSingleImageController } from '~/controllers/media.controller'
import { wrapAsync } from '~/utils/handlers'

const mediaRouter = Router()

mediaRouter.post('/upload-image', wrapAsync(uploadSingleImageController))

export default mediaRouter

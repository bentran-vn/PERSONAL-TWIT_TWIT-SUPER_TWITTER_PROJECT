import { error } from 'console'
import { Request, Response } from 'express'
import path from 'path'
import { UPLOAD_DIR } from '~/constants/dir'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import MediasServices from '~/services/medias.services'

const mediasServicesInstance = MediasServices.getInstance()

export const uploadImageController = async (req: Request, res: Response) => {
  const url = await mediasServicesInstance.uploadImageService(req)
  res.json({
    message: USERS_MESSAGES.UPLOAD_IMAGE_SUCCESS,
    result: url
  })
}

export const serveImageController = async (req: Request, res: Response) => {
  const { namefile } = req.params
  res.sendFile(path.resolve(UPLOAD_DIR, namefile), (error) => {
    if (error) {
      throw new ErrorWithStatus({
        message: error.message,
        status: 404
      })
    }
  })
}

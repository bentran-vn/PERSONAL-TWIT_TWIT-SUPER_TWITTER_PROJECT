import { Request, Response } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import MediasServices from '~/services/medias.services'

const mediasServicesInstance = MediasServices.getInstance()

export const uploadImageController = async (req: Request, res: Response) => {
  const url = await mediasServicesInstance.uploadImageService(req)
  return res.json({
    message: USERS_MESSAGES.UPLOAD_IMAGE_SUCCESS,
    result: url
  })
}

export const uploadVideoController = async (req: Request, res: Response) => {
  const url = await mediasServicesInstance.uploadVideoService(req)
  return res.json({
    message: USERS_MESSAGES.UPLOAD_VIDEO_SUCCESS,
    result: url
  })
}

export const serveImageController = async (req: Request, res: Response) => {
  const { namefile } = req.params
  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, namefile), (error) => {
    if (error) {
      throw new ErrorWithStatus({
        message: error.message,
        status: 404
      })
    }
  })
}
export const serveVideoController = async (req: Request, res: Response) => {
  const { namefile } = req.params
  return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, namefile), (error) => {
    if (error) {
      throw new ErrorWithStatus({
        message: error.message,
        status: 404
      })
    }
  })
}

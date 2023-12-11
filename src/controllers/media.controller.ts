import { Request, Response } from 'express'
import MediasServices from '~/services/medias.services'
import { handleUploadSingleImage } from '~/utils/file'

const mediasServicesInstance = MediasServices.getInstance()

export const uploadSingleImageController = async (req: Request, res: Response) => {
  const result = await mediasServicesInstance.handleUploadSingleImageService(req)
  res.json({
    message: 'Upload successfully',
    result
  })
}

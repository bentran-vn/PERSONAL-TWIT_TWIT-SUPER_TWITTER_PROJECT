import { Request, Response } from 'express'
import { handleUploadSingleImage } from '~/utils/file'

export const uploadSingleImageController = async (req: Request, res: Response) => {
  const result = await handleUploadSingleImage(req)
  res.json({
    message: 'Upload successfully',
    result
  })
}

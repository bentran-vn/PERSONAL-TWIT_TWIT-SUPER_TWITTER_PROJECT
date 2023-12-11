import { Request, Response } from 'express'
import formidable from 'formidable'
import path from 'path'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Error'
import { handleUploadSingleImage } from '~/utils/file'

export const uploadSingleImageController = async (req: Request, res: Response) => {
  const result = await handleUploadSingleImage(req)
  res.json({
    message: 'Upload successfully',
    result
  })
}

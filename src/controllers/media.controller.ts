import { Request, Response } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import MediasServices from '~/services/medias.services'
import fs from 'fs'
import mime from 'mime'

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
  const range = req.headers.range //
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, namefile)
  if (!range) {
    throw new ErrorWithStatus({
      message: 'Range header is required',
      status: HTTP_STATUS.BAD_REQUEST
    })
  }

  //Get size of video
  const videoSize = fs.statSync(videoPath).size
  const CHUNK_SIZE = 10 ** 6 //1MB
  const start = Number(range.replace(/\D/g, ''))
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1)

  //real size of chunk
  const contentLength = end - start + 1
  const contentType = mime.getType(videoPath) || 'video/*'

  // //Response
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }
  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers)
  const videoStream = fs.createReadStream(videoPath, { start, end })
  videoStream.pipe(res)
  return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, namefile), (error) => {
    if (error) {
      throw new ErrorWithStatus({
        message: error.message,
        status: 404
      })
    }
  })
}

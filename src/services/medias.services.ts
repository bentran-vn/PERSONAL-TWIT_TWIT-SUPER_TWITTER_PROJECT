import { Request } from 'express'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import MongodbDatabase from '~/database/MongoDbConnection'
import { getNameFromFullname, handleUploadImage, handleUploadVideo } from '~/utils/file'
import fs from 'fs'
import { isProduction } from '~/constants/config'
import { MediaType } from '~/constants/enums'
import { Media } from '~/models/Media'

const mongodbDatabase = MongodbDatabase.getInstance()

class MediasServices {
  private static instance: MediasServices

  private constructor() {}

  public static getInstance(): MediasServices {
    if (!MediasServices.instance) {
      MediasServices.instance = new MediasServices()
    }
    return MediasServices.instance
  }

  async uploadImageService(req: Request) {
    //Save file to uploads/tmp folder
    const files = await handleUploadImage(req)
    //Handle file by sharp help unitize image
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newFilename = getNameFromFullname(file.newFilename) + '.jpg'
        const newPath = UPLOAD_IMAGE_DIR + '/' + newFilename
        const info = await sharp(file.filepath).jpeg().toFile(newPath)
        //Delete file in uploads/tmp folder
        fs.unlinkSync(file.filepath)
        return {
          url: isProduction
            ? `${process.env.SERVER_URL_PRODUCTION}/static/image/${newFilename}`
            : `${process.env.SERVER_URL_DEVELOPER}/static/image/${newFilename}`,
          type: MediaType.Image
        }
      })
    )
    return result
  }

  async uploadVideoService(req: Request) {
    const files = await handleUploadVideo(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newFilename = file.newFilename
        return {
          url: isProduction
            ? `${process.env.SERVER_URL_PRODUCTION}/static/video/${newFilename}`
            : `${process.env.SERVER_URL_DEVELOPER}/static/video/${newFilename}`,
          type: MediaType.Video
        }
      })
    )
    return result
  }
}

export default MediasServices

import { Request } from 'express'
import sharp from 'sharp'
import { UPLOAD_DIR } from '~/constants/dir'
import MongodbDatabase from '~/database/MongoDbConnection'
import { getNameFromFullname, handleUploadSingleImage } from '~/utils/file'
import fs from 'fs'
import { isProduction } from '~/constants/config'

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

  async handleUploadSingleImageService(req: Request) {
    //Save file to uploads/tmp folder
    const file = await handleUploadSingleImage(req)
    //Handle file by sharp help unitize image
    const newFilename = getNameFromFullname(file.newFilename) + '.jpg'
    const newPath = UPLOAD_DIR + '/' + newFilename
    const info = await sharp(file.filepath).jpeg().toFile(newPath)
    //Delete file in uploads/tmp folder
    fs.unlinkSync(file.filepath)
    return isProduction
      ? `${process.env.SERVER_URL_PRODUCTION}/medias/${newFilename}`
      : `${process.env.SERVER_URL_DEVELOPER}/medias/${newFilename}`
  }
}

export default MediasServices

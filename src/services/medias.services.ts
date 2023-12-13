import { Request } from 'express'
import sharp from 'sharp'
import { UPLOAD_DIR } from '~/constants/dir'
import MongodbDatabase from '~/database/MongoDbConnection'
import { getNameFromFullname, handleUploadImage } from '~/utils/file'
import fs from 'fs'
import { isProduction } from '~/constants/config'

import { MediaType } from '~/constants/enums'
import { Media } from '~/models/media'

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
        const newPath = UPLOAD_DIR + '/' + newFilename
        const info = await sharp(file.filepath).jpeg().toFile(newPath)
        //Delete file in uploads/tmp folder
        fs.unlinkSync(file.filepath)
        return {
          url: isProduction
            ? `${process.env.SERVER_URL_PRODUCTION}/static/${newFilename}`
            : `${process.env.SERVER_URL_DEVELOPER}/static/${newFilename}`,
          type: MediaType.Image
        }
      })
    )
    return result
  }
}

export default MediasServices

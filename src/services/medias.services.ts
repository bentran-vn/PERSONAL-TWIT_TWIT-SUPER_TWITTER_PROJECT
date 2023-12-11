import { Request } from 'express'
import MongodbDatabase from '~/database/MongoDbConnection'
import { handleUploadSingleImage } from '~/utils/file'

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
    const file = await handleUploadSingleImage(req)
  }
}

export default MediasServices

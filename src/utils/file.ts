import path from 'path'
import fs from 'fs'
import { Request } from 'express'
import formidable from 'formidable'
import { ErrorWithStatus } from '~/models/Error'
import HTTP_STATUS from '~/constants/httpStatus'

export const initFolder = () => {
  const uploadFolderPath = path.resolve('uploads')
  if (!fs.existsSync(uploadFolderPath)) {
    fs.mkdirSync(uploadFolderPath, {
      recursive: true
      //Agree to create folder recursively
    })
  }
}

export const handleUploadSingleImage = async (req: Request) => {
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 300 * 1024,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit(
          'error' as any,
          new ErrorWithStatus({
            message: 'File is not valid',
            status: HTTP_STATUS.BAD_REQUEST
          }) as any
        )
      }
      return valid
    }
  })
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (!files.image) {
        return reject(
          new ErrorWithStatus({
            message: 'File is empty',
            status: HTTP_STATUS.BAD_REQUEST
          })
        )
      }
      return resolve(files)
    })
  })
}

import multer from 'multer'
import path from 'path'
import fs from 'fs'

const UPLOAD_BASE_DIR = path.resolve(__dirname, '../../uploads/verifications')

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

const storage = multer.diskStorage({
  destination: (request, _file, callback) => {
    const userId = (request as { userId?: string }).userId
    if (!userId) {
      callback(new Error('userId is required'), UPLOAD_BASE_DIR)
      return
    }
    const userDir = path.join(UPLOAD_BASE_DIR, userId)
    fs.mkdirSync(userDir, { recursive: true })
    callback(null, userDir)
  },
  filename: (request, file, callback) => {
    const userId = (request as { userId?: string }).userId
    if (!userId) {
      callback(new Error('userId is required'), `${file.fieldname}-unknown`)
      return
    }
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname) || '.jpg'
    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
  },
})

function fileFilter(_request: Express.Request, file: Express.Multer.File, callback: multer.FileFilterCallback) {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    callback(null, true)
  } else {
    callback(new Error(`Unsupported file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP`))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
})

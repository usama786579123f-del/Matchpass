const multer = require('multer');
const { ApiError } = require('../utils/apiResponse');
const { FILE_UPLOAD } = require('../utils/constants');

// Files are held in memory then streamed to S3 by the controller/service -
// nothing is ever written to local disk (important on ephemeral hosts like Railway).
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (FILE_UPLOAD.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `Unsupported file type: ${file.mimetype}. Allowed: JPG, PNG, WEBP, PDF.`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: FILE_UPLOAD.MAX_SIZE_MB * 1024 * 1024,
  },
});

module.exports = upload;
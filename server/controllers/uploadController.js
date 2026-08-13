const { uploadBufferToS3, getSignedDownloadUrl } = require('../config/s3');
const { ApiError, success } = require('../utils/apiResponse');

/**
 * @route   POST /api/uploads
 * @desc    Generic authenticated file upload endpoint. Used by:
 *            - Seller delivery proof uploads
 *            - Any other future document upload flow
 *          Dispute evidence has its own inline upload inside
 *          disputeController since it's submitted alongside form fields
 *          in the same request.
 * @access  Any authenticated user
 * @body    multipart/form-data with field "file", optional "folder"
 */
const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No file provided.');
    }

    const folder = req.body.folder && /^[a-z0-9-]+$/i.test(req.body.folder)
      ? req.body.folder
      : 'general';

    const key = await uploadBufferToS3(req.file.buffer, req.file.mimetype, folder);
    const signedUrl = await getSignedDownloadUrl(key, 60 * 60 * 24 * 7); // 7-day signed link

    return success(res, 201, 'File uploaded.', { key, url: signedUrl });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadFile };
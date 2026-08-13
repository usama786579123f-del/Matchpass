const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Uploads a buffer (from multer memoryStorage) to S3 under a folder prefix
 * (e.g. 'dispute-evidence', 'delivery-proofs', 'kyc-documents') and returns
 * the object key. We store the KEY in Mongo, not a public URL — actual
 * access always goes through getSignedDownloadUrl() below, since these
 * are sensitive documents (tickets, ID docs, dispute evidence).
 */
const uploadBufferToS3 = async (buffer, mimetype, folder) => {
  const key = `${folder}/${uuidv4()}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    })
  );

  return key;
};

/**
 * Generates a time-limited signed URL so the frontend can display/download
 * a private file without the bucket ever being public.
 */
const getSignedDownloadUrl = async (key, expiresInSeconds = 3600) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  });
  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
};

module.exports = { s3Client, uploadBufferToS3, getSignedDownloadUrl };
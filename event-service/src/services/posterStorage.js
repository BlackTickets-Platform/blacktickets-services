const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  region: process.env.AWS_REGION
});

const sanitizeFileName = (fileName) => {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
};

const uploadPoster = async (file) => {
  const bucketName = process.env.POSTER_BUCKET_NAME;
  const region = process.env.AWS_REGION;

  if (!bucketName) {
    throw new Error("POSTER_BUCKET_NAME is required to upload event posters");
  }

  if (!region) {
    throw new Error("AWS_REGION is required to upload event posters");
  }

  const key = `event-posters/${Date.now()}-${sanitizeFileName(file.originalname)}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    })
  );

  const cdnDomain = process.env.POSTER_CDN_DOMAIN;
  if (cdnDomain) {
    return `https://${cdnDomain}/${key}`;
  }

  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
};

module.exports = { uploadPoster };

// Jika ingin menggunakan file ini pastikan .env aws sudah diisi dengan credential yang benar
// Jika ingin menggunakan file ini pastikan package aws-sdk sudah terinstall menggunakan "npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner"

const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const {
  getSignedUrl,
} = require('@aws-sdk/s3-request-presigner');

class StorageService {
  constructor() {
    this._S3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async writeFile(file, meta) {
    const parameter = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: meta.filename,
      Body: file._data,
      ContentType: meta.headers['content-type'],
    });

    await this._S3.send(parameter);

    return this.createPreSignedUrl({
      bucket: process.env.AWS_BUCKET_NAME,
      key: meta.filename,
    });
  }

  createPreSignedUrl({ bucket, key }) {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(this._S3, command, { expiresIn: 3600 });
  }
}

module.exports = StorageService;
import aws from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
})

export const createUploader = (folder: string) => multer({
    storage: multerS3({
        s3:s3 as any,
        bucket: process.env.AWS_BUCKET_NAME!,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
            cb(null, `${folder}/${Date.now()}-${file.originalname}`);
        },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
})
export const deleteFromS3 = async (file?: Express.Multer.File) => {
  if (!file) return;
  await s3.deleteObject({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: (file as any).key,
  }).promise();
};
export const replaceS3Image = async (imageUrl: string | null | undefined) => {
  if (!imageUrl) return;
  const key = decodeURIComponent(imageUrl.split('.com/')[1]);
  await s3.deleteObject({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
  }).promise();
};
export {s3}
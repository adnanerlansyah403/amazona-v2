import nc from 'next-connect';
import { isAdmin, isAuth } from '../../../utils/auth';
import db from '../../../utils/db';
import streamifier from "streamifier";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const config = {
    api: {
        bodyParse: false,
    },
}
const onError = async (err, req, res) => {
  await db.disconnect();
  res.status(500).send({ message: err.toString() });
};

const handler = nc({
  onError,
});

const upload = multer();

handler.use(isAuth, isAdmin, upload.single('file')).post(async (req, res) => {
    const streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload((error, result) => {
                if(result) {
                    return resolve(result);
                }
                return reject(new Error(`Upload failed: ${error}`));
            });
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };
    const result = await streamUpload(req);

    return res.send(result);
})



export default handler;
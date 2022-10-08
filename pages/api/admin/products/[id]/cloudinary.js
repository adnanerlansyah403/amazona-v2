import nc from 'next-connect';
import { v2 as cloudinary } from 'cloudinary';
import db from '../../../../../utils/db';
import { isAdmin, isAuth } from '../../../../../utils/auth';
import Product from '../../../../../models/ProductModel';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const onError = async (err, req, res) => {
  await db.disconnect();
  res.status(500).send({ message: err.toString() });
};

const handler = nc({
    onError
});

handler.use(isAuth, isAdmin);

handler.get(async (req, res) => {

  
  await db.connect();

  const product = await Product.findById(req.query.id);

  const result = await cloudinary.api.resource(product.image.public_id, {
    color: true,
  });
  
  await db.disconnect();

  // console.log(result);

});

export default handler;